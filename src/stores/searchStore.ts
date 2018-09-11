import { action, computed, observable } from 'mobx';

export class SearchStore {
    @observable private _searchInput: string;
    @observable private _subLineItems: {
        routePathId: string;
        routeId: string;
    }[];
    @observable private _filters: string[];

    constructor() {
        this._searchInput = '';
        this._subLineItems = [];
        this._filters = [];
    }

    @computed get searchInput(): string {
        return this._searchInput;
    }

    @action
    public setSearchInput(input: string) {
        this._searchInput = input;
    }

    @action
    public addSubLineItem(routeId: string, routePathId: string) {
        this._subLineItems.push({
            routeId,
            routePathId,
        });
    }

    @action
    public removeSubLineItem(routeId: string, routePathId: string) {
        this._subLineItems = this._subLineItems.filter((subLineItem) =>  {
            return !(subLineItem.routeId === routeId
                && subLineItem.routePathId === routePathId);
        });
    }

    @action
    public removeAllSubLineItems() {
        this._subLineItems = [];
    }

    @computed get subLineItems(): any {
        return this._subLineItems;
    }

    @computed get filters(): string[] {
        return this._filters;
    }

    set filters(value: string[]) {
        this._filters = value;
    }
}

const observableSearchStore = new SearchStore();

export default observableSearchStore;
