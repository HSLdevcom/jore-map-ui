import _ from 'lodash';
import { action, computed, observable } from 'mobx';
import { ILine } from '~/models';

export class LineStore {
    @observable private _line: ILine | null;
    @observable private _oldline: ILine | null;
    @observable private _isEditingDisabled: boolean;

    constructor() {
        this._isEditingDisabled = true;
    }

    @computed
    get line(): ILine | null {
        return this._line;
    }

    @computed
    get oldLine(): ILine | null {
        return this._oldline;
    }

    @computed
    get isDirty() {
        return !_.isEqual(this._line, this._oldline);
    }

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    // TODO: rename as init
    @action
    public setLine = (line: ILine) => {
        this._line = line;
        this.setOldLine(this._line);
    };

    @action
    public setOldLine = (line: ILine) => {
        this._oldline = _.cloneDeep(line);
    };

    @action
    public updateLineProperty = (property: keyof ILine, value: string | number | Date) => {
        this._line = {
            ...this._line!,
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
        this._line = null;
    };

    @action
    public resetChanges = () => {
        if (this._oldline) {
            this.setLine(this._oldline);
        }
    };
}

const observableLineStore = new LineStore();

export default observableLineStore;
