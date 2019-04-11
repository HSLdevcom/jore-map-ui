import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { ILine } from '~/models';

// TODO: REMOVE?
export enum LineViewTab {
    Info,
    List,
}

export class LineStore {
    @observable private _line: ILine|null;
    @observable private _oldline: ILine|null;
    @observable private _activeTab: LineViewTab;

    constructor() {
        this._activeTab = LineViewTab.Info;
    }

    @computed
    get line(): ILine|null {
        return this._line;
    }

    get isDirty() {
        return !_.isEqual(this._line, this._oldline);
    }

    @computed
    get activeTab() {
        return this._activeTab;
    }

    @action
    public setActiveTab = (tab: LineViewTab) => {
        this._activeTab = tab;
    }

    @action
    public toggleActiveTab = () => {
        if (this._activeTab === LineViewTab.Info) {
            this._activeTab = LineViewTab.List;
        } else {
            this._activeTab = LineViewTab.Info;
        }
    }

    @action
    public setLine = (line: ILine) => {
        this._line = line;
        this.setOldLine(this._line);
    }

    @action
    public setOldLine = (line: ILine) => {
        this._oldline = _.cloneDeep(line);
    }

    @action
    public updateLineProperty = (property: string, value: string|number|Date) => {
        this._line = {
            ...this._line!,
            [property]: value,
        };
    }

    @action
    public resetChanges = () => {
        if (this._oldline) {
            this.setLine(this._oldline);
        }
    }

    @action
    public clear = () => {
        this._line = null;
    }

}

const observableLineStore = new LineStore();

export default observableLineStore;
