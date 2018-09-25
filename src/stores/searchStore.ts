import { action, computed, observable } from 'mobx';
import TransitType from '../enums/transitType';

export class SearchStore {
    @observable private _searchInput: string;
    @observable private _subLineItems: {
        routePathId: string;
        routeId: string;
    }[];
    @observable private _selectedTypes: TransitType[];

    constructor() {
        this._searchInput = '';
        this._subLineItems = [];
        this._selectedTypes = [
            TransitType.BUS,
            TransitType.FERRY,
            TransitType.SUBWAY,
            TransitType.TRAIN,
            TransitType.TRAM,
        ];
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

    @computed get selectedTypes(): TransitType[] {
        return this._selectedTypes;
    }

    @action
    public toggleSelectedTypes(type: TransitType) {
        if (this._selectedTypes.includes(type)) {
            this._selectedTypes = this._selectedTypes.filter(t => t !== type);
        } else {
            this._selectedTypes.push(type);
        }
    }
}

const observableSearchStore = new SearchStore();

export default observableSearchStore;
