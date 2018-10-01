import { action, computed, observable } from 'mobx';
import TransitType from '../enums/transitType';

export class NetworkStore {
    @observable private _selectedTypes: TransitType[];
    @observable private _isLinksVisible: boolean;
    @observable private _isNodesVisible: boolean;
    @observable private _isPointsVisible: boolean;

    constructor() {
        this._selectedTypes = [
            TransitType.BUS,
            TransitType.FERRY,
            TransitType.SUBWAY,
            TransitType.TRAIN,
            TransitType.TRAM,
        ];
        this._isLinksVisible = false;
        this._isNodesVisible = false;
        this._isPointsVisible = false;
    }

    @computed get isLinksVisible(): boolean {
        return this._isLinksVisible;
    }

    @action
    public toggleShowLinks() {
        this._isLinksVisible = !this._isLinksVisible;
    }

    @computed get isNodesVisible(): boolean {
        return this._isNodesVisible;
    }

    @action
    public toggleShowNodes() {
        this._isNodesVisible = !this._isNodesVisible;
    }

    @computed get isPointsVisible(): boolean {
        return this._isPointsVisible;
    }

    @action
    public toggleShowPoints() {
        this._isPointsVisible = !this._isPointsVisible;
    }

    @computed get selectedTypes() {
        return this._selectedTypes;
    }

    @action
    public toggleTransitType(type: TransitType) {
        if (this._selectedTypes.includes(type)) {
            this._selectedTypes = this._selectedTypes.filter(t => t !== type);
        } else {
            this._selectedTypes.push(type);
        }
    }
}

const observableNetworkStore = new NetworkStore();

export default observableNetworkStore;
