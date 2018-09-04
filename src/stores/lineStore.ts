import { action, computed, observable } from 'mobx';
import { ILine } from '../models';

export class LineStore {
    @observable private _filters: string[];
    @observable private _allLines: ILine[];

    constructor() {
        this._allLines = [];
    }

    @computed get filters(): string[] {
        return this._filters;
    }

    set filters(filters: string[]) {
        this._filters = filters;
    }

    @computed get allLines(): ILine[] {
        return this._allLines;
    }

    @action
    public setAllLines(lines: ILine[]) {
        this._allLines = lines;
    }
}

const observableLineStore = new LineStore();

export default observableLineStore;
