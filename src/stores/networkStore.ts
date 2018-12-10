import { action, computed, observable } from 'mobx';
import TransitType from '~/enums/transitType';

const TRANSIT_TYPES = [
    TransitType.BUS,
    TransitType.FERRY,
    TransitType.SUBWAY,
    TransitType.TRAIN,
    TransitType.TRAM,
];

export enum NodeSize {
    normal,
    large,
}

export class NetworkStore {
    @observable private _selectedTransitTypes: TransitType[];
    @observable private _isLinksVisible: boolean;
    @observable private _isNodesVisible: boolean;
    @observable private _isPointsVisible: boolean;
    @observable private _nodeSize:NodeSize;

    constructor() {
        this._selectedTransitTypes = TRANSIT_TYPES;
        this._isLinksVisible = false;
        this._isNodesVisible = false;
        this._isPointsVisible = false;
        this._nodeSize = NodeSize.normal;
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

    @computed
    get nodeSize(): NodeSize {
        return this._nodeSize;
    }

    @action
    public setNodeVisibility(isVisible: boolean) {
        this._isNodesVisible = isVisible;
    }

    @action
    public setLinkVisibility(isVisible: boolean) {
        this._isLinksVisible = isVisible;
    }

    @action
    public setPointVisibility(isVisible: boolean) {
        this._isPointsVisible = isVisible;
    }

    @action
    public toggleLinkVisibility() {
        this._isLinksVisible = !this._isLinksVisible;
    }

    @action
    public toggleNodeVisibility() {
        this._isNodesVisible = !this._isNodesVisible;
    }

    @action
    public togglePointVisibility() {
        this._isPointsVisible = !this._isPointsVisible;
    }

    @action
    public setSelectedTransitTypes(types: TransitType[]) {
        this._selectedTransitTypes = types;
    }

    @action
    public selectAllTransitTypes() {
        this._selectedTransitTypes = TRANSIT_TYPES;
    }

    @action
    setNodeSize(nodeSize: NodeSize) {
        this._nodeSize = nodeSize;
    }

    // TODO rename as toggleSelectedTransitType?
    @action
    public toggleTransitType(type: TransitType) {
        if (this._selectedTransitTypes.includes(type)) {
            this._selectedTransitTypes = this._selectedTransitTypes.filter(t => t !== type);
        } else {
            // Need to do concat (instead of push) to trigger ReactionDisposer watcher
            this._selectedTransitTypes = this._selectedTransitTypes.concat([type]);
        }
    }
}

const observableNetworkStore = new NetworkStore();

export default observableNetworkStore;
