import _ from 'lodash';
import { action, computed, observable } from 'mobx';
import { ILineHeader } from '~/models';
import { IValidationResult } from '~/validation/FormValidator';

interface IMassEditLineHeader {
    id: number;
    lineHeader: ILineHeader;
    oldDates: {
        startDate: Date;
        endDate: Date;
    };
}

interface ILineHeaderValidationResult {
    [key: number]: IValidationResult;
}

export class LineHeaderMassEditStore {
    @observable private _massEditLineHeaders: IMassEditLineHeader[] | null;
    @observable private _oldlineHeaders: ILineHeader[] | null;
    @observable private _isEditingDisabled: boolean;
    @observable private _validationResults: ILineHeaderValidationResult | null;

    constructor() {
        this._isEditingDisabled = true;
    }

    @computed
    get massEditLineHeaders(): IMassEditLineHeader[] | null {
        return this._massEditLineHeaders;
    }

    @computed
    get isDirty() {
        const lineHeaders = this._massEditLineHeaders!.map(
            massEditLineHeader => massEditLineHeader.lineHeader
        );
        return !_.isEqual(lineHeaders, this._oldlineHeaders);
    }

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    @computed
    get validationResults(): ILineHeaderValidationResult | null {
        return this._validationResults;
    }

    @action
    public init = (lineHeaders: ILineHeader[]) => {
        this.clear();

        this._massEditLineHeaders = lineHeaders.map((lineHeader: ILineHeader, index: number) => {
            return {
                lineHeader,
                id: index,
                oldDates: {
                    startDate: lineHeader.startDate,
                    endDate: lineHeader.endDate
                }
            };
        });
        this.setOldLineHeaders(lineHeaders);
    };

    @action
    public setOldLineHeaders = (lineHeaders: ILineHeader[]) => {
        this._oldlineHeaders = _.cloneDeep(lineHeaders);
    };

    @action
    public updateLineHeaderStartDate = (id: number, value: Date) => {
        const massEditLineHeader = this._massEditLineHeaders!.find(
            lineHeader => id === lineHeader.id
        );
        massEditLineHeader!.lineHeader.startDate = value;
        this._massEditLineHeaders = this._massEditLineHeaders!.slice().sort(
            _sortMassEditLineHeaders
        );
        this.validateDates();
    };

    @action
    public updateLineHeaderEndDate = (id: number, value: Date) => {
        const massEditLineHeader = this._massEditLineHeaders!.find(
            lineHeader => id === lineHeader.id
        );
        massEditLineHeader!.lineHeader.endDate = value;
        this._massEditLineHeaders = this._massEditLineHeaders!.slice().sort(
            _sortMassEditLineHeaders
        );
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
        this._validationResults = null;
    };

    @action
    public resetChanges = () => {
        if (this._oldlineHeaders) {
            this.init(this._oldlineHeaders);
        }
    };

    public getOldLineHeaderStartDate = (id: number) => {
        return this._massEditLineHeaders!.find(m => m.id === id)!.oldDates.startDate;
    };

    @action
    private validateDates = () => {
        let previousObj: IMassEditLineHeader;
        this._massEditLineHeaders!.forEach(currentObj => {
            if (previousObj) {
                const areDatesContinuing = _isNextDate(
                    previousObj.lineHeader.endDate,
                    currentObj.lineHeader.startDate
                );
                if (!areDatesContinuing) {
                    this.setValidationResult(currentObj.id, false, 'Päivämäärän oltava jatkuva');
                } else if (currentObj.lineHeader.startDate > currentObj.lineHeader.endDate) {
                    this.setValidationResult(
                        currentObj.id,
                        false,
                        'Voim.ast oltava ennen voim.viim'
                    );
                } else {
                    this.setValidationResult(currentObj.id, true);
                }
            }
            previousObj = currentObj;
        });
    };

    @action
    private setValidationResult = (index: number, isValid: boolean, errorMessage?: string) => {
        if (!this._validationResults) {
            this._validationResults = {};
        }
        this._validationResults[index] = {
            isValid,
            errorMessage
        };
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

export { IMassEditLineHeader };
