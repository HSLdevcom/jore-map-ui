import { action, computed, observable } from 'mobx';
import { ILine } from '~/models';

export class LineStore {
    @observable private _allLines: ILine[];

    constructor() {
        this._allLines = [];
    }

    @computed
    get allLines(): ILine[] {
        return this._allLines;
    }

    @action
    public setAllLines = (lines: ILine[]) => {
        this._allLines = lines;
    }
}

const observableLineStore = new LineStore();

export default observableLineStore;
