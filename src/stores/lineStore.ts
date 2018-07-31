import { action, computed, observable } from 'mobx';
import { ILine } from '../models';

export class LineStore {
    @observable private _filters: string[];
    @observable private _selectedLines: ILine[];
    @observable private _allLines: ILine[];

    constructor() {
        this._selectedLines = [];
        this._allLines = [];
    }

    @computed get selectedLines(): ILine[] {
        return this._selectedLines;
    }

    @computed get filters(): string[] {
        return this._filters;
    }

    set filters(filters: string[]) {
        this._filters = filters;
    }

    @action
    public addSelectedLine(node: ILine) {
        this._selectedLines.push(node);
    }

    @action
    public removeSelectedLines() {
        this._selectedLines = [];
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
