import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { ILineHeader } from '~/models';

export class LineHeaderStore {
    @observable private _lineHeader: ILineHeader | null;
    @observable private _oldlineHeader: ILineHeader | null;

    @computed
    get lineHeader(): ILineHeader | null {
        return this._lineHeader;
    }

    get isDirty() {
        return !_.isEqual(this._lineHeader, this._oldlineHeader);
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
    public resetChanges = () => {
        if (this._oldlineHeader) {
            this.setLineHeader(this._oldlineHeader);
        }
    };

    @action
    public clear = () => {
        this._lineHeader = null;
    };
}

const observableLineHeaderStore = new LineHeaderStore();

export default observableLineHeaderStore;
