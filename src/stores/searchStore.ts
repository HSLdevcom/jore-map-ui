import { action, computed, observable } from 'mobx';

export class SearchStore {
    @observable private _subLineItems: {
        routePathId: string;
        routeId: string;
    }[];

    constructor() {
        this._subLineItems = [];
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
}

const observableSearchStore = new SearchStore();

export default observableSearchStore;
