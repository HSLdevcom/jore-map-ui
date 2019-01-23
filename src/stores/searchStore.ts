import { action, computed, observable } from 'mobx';
import TransitType from '~/enums/transitType';

export class SearchStore {
    @observable private _searchInput: string;
    @observable private _subLineItems: {
        routePathId: string;
        routeId: string;
    }[];
    @observable private _selectedTransitTypes: TransitType[];

    constructor() {
        this._searchInput = '';
        this._subLineItems = [];
        this._selectedTransitTypes = [
            TransitType.BUS,
            TransitType.FERRY,
            TransitType.SUBWAY,
            TransitType.TRAIN,
            TransitType.TRAM,
        ];
    }

    @computed
    get searchInput(): string {
        return this._searchInput;
    }

    @action
    public setSearchInput = (input: string) => {
        this._searchInput = input;
    }

    @action
    public addSubLineItem = (routeId: string, routePathId: string) => {
        this._subLineItems.push({
            routeId,
            routePathId,
        });
    }

    @action
    public removeSubLineItem = (routeId: string, routePathId: string) => {
        this._subLineItems = this._subLineItems.filter((subLineItem) =>  {
            return !(subLineItem.routeId === routeId
                && subLineItem.routePathId === routePathId);
        });
    }

    @action
    public removeAllSubLineItems = () => {
        this._subLineItems = [];
    }

    @computed
    get subLineItems(): any {
        return this._subLineItems;
    }

    @computed
    get selectedTransitTypes(): TransitType[] {
        return this._selectedTransitTypes;
    }

    @action
    public toggleTransitType = (type: TransitType) => {
        if (this._selectedTransitTypes.includes(type)) {
            this._selectedTransitTypes = this._selectedTransitTypes.filter(t => t !== type);
        } else {
            this._selectedTransitTypes.push(type);
        }
    }
}

const observableSearchStore = new SearchStore();

export default observableSearchStore;
