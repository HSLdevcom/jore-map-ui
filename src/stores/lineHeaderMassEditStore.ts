import _ from 'lodash';
import { action, computed, observable } from 'mobx';
import { ILineHeader } from '~/models';

export class LineHeaderMassEditStore {
    @observable private _lineHeaders: ILineHeader[] | null;
    @observable private _oldlineHeaders: ILineHeader[] | null;
    @observable private _isEditingDisabled: boolean;

    constructor() {
        this._isEditingDisabled = true;
    }

    @computed
    get lineHeaders(): ILineHeader[] | null {
        return this._lineHeaders;
    }

    @computed
    get isDirty() {
        return !_.isEqual(this._lineHeaders, this._oldlineHeaders);
    }

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    @action
    public init = (lineHeaders: ILineHeader[]) => {
        this._lineHeaders = lineHeaders;
        this.setOldLineHeaders(this._lineHeaders);
    };

    @action
    public setOldLineHeaders = (lineHeaders: ILineHeader[]) => {
        this._oldlineHeaders = _.cloneDeep(lineHeaders);
    };

    @action
    public updateLineHeaderProperty = (
        property: keyof ILineHeader[],
        value: string | number | Date
    ) => {
        this._lineHeaders = {
            ...this._lineHeaders!,
            [property]: value
        };
    };

    @action
    public setIsEditingDisabled = (isEditingDisabled: boolean) => {
        this._isEditingDisabled = isEditingDisabled;
    };

    @action
    public toggleIsEditingDisabled = () => {
        this._isEditingDisabled = !this._isEditingDisabled;
    };

    @action
    public clear = () => {
        this._lineHeaders = null;
    };

    @action
    public resetChanges = () => {
        if (this._oldlineHeaders) {
            this.init(this._oldlineHeaders);
        }
    };
}

const observableLineHeaderStore = new LineHeaderMassEditStore();

export default observableLineHeaderStore;
