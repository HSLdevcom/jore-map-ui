import { action, computed, observable } from 'mobx';
import TransitType from '~/enums/transitType';

export class NetworkStore {
    @observable private _selectedTransitTypes: TransitType[];
    @observable private _isLinksVisible: boolean;
    @observable private _isNodesVisible: boolean;
    @observable private _isPointsVisible: boolean;

    constructor() {
        this._selectedTransitTypes = [
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

    @computed
    get selectedTransitTypes() {
        return this._selectedTransitTypes;
    }

    @computed
    get isLinksVisible(): boolean {
        return this._isLinksVisible;
    }

    @computed
    get isNodesVisible(): boolean {
        return this._isNodesVisible;
    }

    @computed
    get isPointsVisible(): boolean {
        return this._isPointsVisible;
    }

    @action
    public setIsNodesVisible(isVisible: boolean) {
        this._isNodesVisible = isVisible;
    }

    @action
    public setIsLinksVisible(isVisible: boolean) {
        this._isLinksVisible = isVisible;
    }

    @action
    public setIsPointsVisible(isVisible: boolean) {
        this._isPointsVisible = isVisible;
    }

    @action
    public toggleIsLinksVisible() {
        this._isLinksVisible = !this._isLinksVisible;
    }

    @action
    public toggleIsNodesVisible() {
        this._isNodesVisible = !this._isNodesVisible;
    }

    @action
    public toggleIsPointsVisible() {
        this._isPointsVisible = !this._isPointsVisible;
    }

    @action
    public toggleTransitType(type: TransitType) {
        if (this._selectedTransitTypes.includes(type)) {
            this._selectedTransitTypes = this._selectedTransitTypes.filter(t => t !== type);
        } else {
            this._selectedTransitTypes.push(type);
        }
    }
}

const observableNetworkStore = new NetworkStore();

export default observableNetworkStore;
