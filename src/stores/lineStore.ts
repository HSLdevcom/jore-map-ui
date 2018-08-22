import { action, computed, observable } from 'mobx';
import { ILine } from '../models';

export class LineStore {
    @observable private _filters: string[];
    @observable private _allLines: ILine[];
    @observable private _searchInput: string;

    constructor() {
        this._allLines = [];
        this._searchInput = '';
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

    public lineByLineId(lineId: string) {
        return this._allLines.find(line => line.lineId === lineId);
    }

    @computed get searchInput(): string {
        return this._searchInput;
    }

    @action
    public setSearchInput(input: string) {
        this._searchInput = input;
    }

    @action
    public setAllLines(lines: ILine[]) {
        this._allLines = lines;
    }

    @computed get lineSearchVisible(): boolean {
        return (this._searchInput.length > 0);
    }

}

const observableLineStore = new LineStore();

export default observableLineStore;
