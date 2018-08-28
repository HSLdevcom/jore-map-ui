import { action, computed, observable } from 'mobx';
import { ILine } from '../models';

export class LineStore {
    @observable private _filters: string[];
    @observable private _allLines: ILine[];
    @observable private _searchInput: string;
    @observable private _linesLoading: boolean;
    @observable private _lineSearchVisible: boolean;

    constructor() {
        this._allLines = [];
        this._searchInput = '';
        this._linesLoading = true;
        this._lineSearchVisible = true;
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
        this.linesLoading = false;
    }

    @computed get linesLoading(): boolean {
        return this._linesLoading;
    }

    set linesLoading(value: boolean) {
        this._linesLoading = value;
    }

    @computed get lineSearchVisible(): boolean {
        return this._lineSearchVisible || (this._searchInput.length > 0);
    }

    set lineSearchVisible(value: boolean) {
        this._lineSearchVisible = value;
    }

}

const observableLineStore = new LineStore();

export default observableLineStore;
