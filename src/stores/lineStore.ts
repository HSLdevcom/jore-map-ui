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
}

const observableLineStore = new LineStore();

export default observableLineStore;
