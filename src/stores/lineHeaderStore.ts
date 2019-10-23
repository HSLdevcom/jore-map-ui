import _ from 'lodash';
import { action, computed, observable } from 'mobx';
import { ILineHeader } from '~/models';

export class LineHeaderStore {
    @observable private _lineHeader: ILineHeader | null;
    @observable private _oldlineHeader: ILineHeader | null;
    @observable private _isEditingDisabled: boolean;

    constructor() {
        this._isEditingDisabled = true;
    }

    @computed
    get lineHeader(): ILineHeader | null {
        return this._lineHeader;
    }

    @computed
    get isDirty() {
        return !_.isEqual(this._lineHeader, this._oldlineHeader);
    }

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    @action
    public setLineHeader = (lineHeader: ILineHeader) => {
        this._lineHeader = lineHeader;
        this.setOldLineHeader(this._lineHeader);
    };

    @action
    public setOldLineHeader = (lineHeader: ILineHeader) => {
        this._oldlineHeader = _.cloneDeep(lineHeader);
    };

    @action
    public updateLineHeaderProperty = (
        property: keyof ILineHeader,
        value: string | number | Date
    ) => {
        this._lineHeader = {
            ...this._lineHeader!,
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
        this._lineHeader = null;
    };

    @action
    public resetChanges = () => {
        if (this._oldlineHeader) {
            this.setLineHeader(this._oldlineHeader);
        }
    };
}

const observableLineHeaderStore = new LineHeaderStore();

export default observableLineHeaderStore;
