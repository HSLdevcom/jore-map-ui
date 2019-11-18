import _ from 'lodash';
import { action, computed, observable } from 'mobx';
import { ILineHeader } from '~/models';
import { IValidationResult } from '~/validation/FormValidator';

export interface IMassEditLineHeader {
    id: number;
    lineHeader: ILineHeader;
    validationResult: IValidationResult;
}

export class LineHeaderMassEditStore {
    @observable private _massEditLineHeaders: IMassEditLineHeader[] | null;
    @observable private _oldlineHeaders: ILineHeader[] | null;
    @observable private _isEditingDisabled: boolean;

    constructor() {
        this._massEditLineHeaders = null;
        this._isEditingDisabled = true;
    }

    @computed
    get massEditLineHeaders(): IMassEditLineHeader[] | null {
        return this._massEditLineHeaders;
    }

    @computed
    get currentLineHeaders(): ILineHeader[] {
        return _.chain(this._massEditLineHeaders)
            .map(massEditLineHeader => massEditLineHeader.lineHeader)
            .value();
    }

    @computed
    get isDirty() {
        return !_.isEqual(this.currentLineHeaders, this._oldlineHeaders);
    }

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    @action
    public init = (lineHeaders: ILineHeader[]) => {
        this.clear();

        this._massEditLineHeaders = lineHeaders.map((lineHeader: ILineHeader, index: number) => {
            const clonedLineHeader = _.cloneDeep(lineHeader);
            clonedLineHeader.originalStartDate = lineHeader.startDate;
            const massEditLineHeader: IMassEditLineHeader = {
                id: index,
                lineHeader: clonedLineHeader,
                validationResult: {
                    isValid: true
                }
            };
            return massEditLineHeader;
        });
        this.setOldLineHeaders(lineHeaders);
    };

    @action
    public setOldLineHeaders = (lineHeaders: ILineHeader[]) => {
        this._oldlineHeaders = _.cloneDeep(lineHeaders);
    };

    @action
    public updateLineHeaderStartDate = (id: number, value: Date) => {
        const massEditLineHeader = this.getMassEditLineHeader(id);

        massEditLineHeader!.lineHeader.startDate = value;
        this._massEditLineHeaders = this._massEditLineHeaders!.slice().sort(
            _sortMassEditLineHeaders
        );
        this.validateDates();
    };

    @action
    public updateLineHeaderEndDate = (id: number, value: Date) => {
        const massEditLineHeader = this.getMassEditLineHeader(id);

        massEditLineHeader!.lineHeader.endDate = value;
        this._massEditLineHeaders = this._massEditLineHeaders!.slice().sort(
            _sortMassEditLineHeaders
        );
        this.validateDates();
    };

    @action
    public removeLineHeader = (id: number) => {
        this._massEditLineHeaders = this.massEditLineHeaders!.filter(m => m.id !== id);
        this.validateDates();
    };

    @action
    public setIsEditingDisabled = (isEditingDisabled: boolean) => {
        this._isEditingDisabled = isEditingDisabled;
    };

    @action
    public toggleIsEditingDisabled = () => {
        this._isEditingDisabled = !this._isEditingDisabled;
        if (this._isEditingDisabled) {
            this.resetChanges();
        } else {
            this.validateDates();
        }
    };

    @action
    public clear = () => {
        this._massEditLineHeaders = null;
        this._oldlineHeaders = null;
        this._isEditingDisabled = true;
    };

    @action
    public resetChanges = () => {
        if (this._oldlineHeaders) {
            this.init(this._oldlineHeaders);
        }
    };

    @action
    private validateDates = () => {
        let previousMassEditLineHeader: IMassEditLineHeader;
        this._massEditLineHeaders!.forEach(currentMassEditLineHeader => {
            if (
                currentMassEditLineHeader.lineHeader.startDate >
                currentMassEditLineHeader.lineHeader.endDate
            ) {
                this.setValidationResult(
                    currentMassEditLineHeader.id,
                    false,
                    'Voim.ast oltava ennen voim.viim'
                );
                return;
            }
            if (previousMassEditLineHeader) {
                const areDatesContinuing = _isNextDate(
                    previousMassEditLineHeader.lineHeader.endDate,
                    currentMassEditLineHeader.lineHeader.startDate
                );
                if (!areDatesContinuing) {
                    this.setValidationResult(
                        currentMassEditLineHeader.id,
                        false,
                        'Päivämäärän oltava jatkuva'
                    );
                    return;
                }
            }
            this.setValidationResult(currentMassEditLineHeader.id, true);
            previousMassEditLineHeader = currentMassEditLineHeader;
        });
    };

    @action
    private setValidationResult = (id: number, isValid: boolean, errorMessage?: string) => {
        const massEditLineHeader = this.getMassEditLineHeader(id);
        massEditLineHeader!.validationResult = {
            isValid,
            errorMessage
        };
    };

    @action
    private getMassEditLineHeader = (id: number) => {
        return this._massEditLineHeaders!.find(m => _.isEqual(m.id, id));
    };
}

const _sortMassEditLineHeaders = (a: IMassEditLineHeader, b: IMassEditLineHeader) => {
    if (a.lineHeader.startDate < b.lineHeader.startDate) return -1;
    if (a.lineHeader.startDate > b.lineHeader.startDate) return 1;
    return 0;
};

// Is b next date of a
const _isNextDate = (a: Date, b: Date) => {
    const nextDayOfA = new Date(a);
    nextDayOfA.setDate(a.getDate() + 1);
    return _isSameDay(nextDayOfA, b);
};
const _isSameDay = (a: Date, b: Date) => {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
};

const observableLineHeaderStore = new LineHeaderMassEditStore();

export default observableLineHeaderStore;
