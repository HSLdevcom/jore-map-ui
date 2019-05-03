import { action, computed, observable } from 'mobx';
import Moment from 'moment';
import TransitType from '~/enums/transitType';

const TRANSIT_TYPES = [
    TransitType.BUS,
    TransitType.FERRY,
    TransitType.SUBWAY,
    TransitType.TRAIN,
    TransitType.TRAM
];

export enum NodeSize {
    normal,
    large
}

export enum MapLayer { // TODO change name to something better
    node,
    link,
    linkPoint,
    nodeWithoutLink
}

export class NetworkStore {
    @observable private _selectedTransitTypes: TransitType[];
    @observable private _selectedDate: Moment.Moment;
    @observable private _visibleMapLayers: MapLayer[];
    @observable private _nodeSize: NodeSize;
    private _savedMapLayers: MapLayer[];

    constructor() {
        this._selectedTransitTypes = TRANSIT_TYPES;
        this._visibleMapLayers = [];
        this._nodeSize = NodeSize.normal;
        this._savedMapLayers = [];
    }

    @computed
    get selectedTransitTypes() {
        return this._selectedTransitTypes;
    }

    @computed
    get selectedDate(): Moment.Moment {
        return this._selectedDate;
    }

    @action
    public setSelectedDate = (value: Moment.Moment | string) => {
        if (typeof value === 'string') {
            this._selectedDate = Moment(value);
        } else {
            this._selectedDate = value;
        }
    };

    @computed
    get nodeSize(): NodeSize {
        return this._nodeSize;
    }

    @computed
    get visibleMapLayers() {
        return this._visibleMapLayers;
    }

    @computed
    get isMapLayersVisible(): boolean {
        return this._visibleMapLayers && this._visibleMapLayers.length !== 0;
    }

    public isMapLayerVisible = (mapLayer: MapLayer) => {
        return this._visibleMapLayers.includes(mapLayer);
    };

    @action
    public setVisibleMapLayers = (layers: MapLayer[]) => {
        this._visibleMapLayers = layers;
    };

    @action
    public toggleMapLayerVisibility = (mapLayer: MapLayer) => {
        if (this._visibleMapLayers.includes(mapLayer)) {
            this.hideMapLayer(mapLayer);
        } else {
            this.showMapLayer(mapLayer);
        }
    };

    @action
    public showMapLayer = (mapLayer: MapLayer) => {
        // Need to do concat (instead of push) to trigger ReactionDisposer watcher
        this._visibleMapLayers = this._visibleMapLayers.concat([mapLayer]);
    };

    @action
    public hideAllMapLayers = () => {
        this._visibleMapLayers = [];
    };

    @action
    public hideMapLayer = (mapLayer: MapLayer) => {
        this._visibleMapLayers = this._visibleMapLayers.filter(
            mL => mL !== mapLayer
        );
    };

    @action
    public setSelectedTransitTypes = (types: TransitType[]) => {
        this._selectedTransitTypes = types;
    };

    @action
    public selectAllTransitTypes = () => {
        this._selectedTransitTypes = TRANSIT_TYPES;
    };

    @action
    public setNodeSize = (nodeSize: NodeSize) => {
        this._nodeSize = nodeSize;
    };

    // TODO rename as toggleSelectedTransitType?
    @action
    public toggleTransitType = (type: TransitType) => {
        if (this._selectedTransitTypes.includes(type)) {
            this._selectedTransitTypes = this._selectedTransitTypes.filter(
                t => t !== type
            );
        } else {
            // Need to do concat (instead of push) to trigger ReactionDisposer watcher
            this._selectedTransitTypes = this._selectedTransitTypes.concat([
                type
            ]);
        }
    };

    @action
    restoreSavedMapLayers() {
        this.setVisibleMapLayers(this._savedMapLayers);
        this._savedMapLayers = [];
    }

    saveMapLayers() {
        this._savedMapLayers = this._visibleMapLayers;
    }
}

const observableNetworkStore = new NetworkStore();

export default observableNetworkStore;
