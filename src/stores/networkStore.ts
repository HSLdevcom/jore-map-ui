import { action, computed, observable } from 'mobx';
import Moment from 'moment';
import TransitType from '~/enums/transitType';
import LocalStorageHelper from '~/util/localStorageHelper';

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
    @observable private _selectedDate: Moment.Moment | null;
    @observable private _visibleMapLayers: MapLayer[];
    @observable private _nodeSize: NodeSize;
    private _savedMapLayers: MapLayer[];

    constructor() {
        this._selectedTransitTypes = TRANSIT_TYPES;
        this._visibleMapLayers = [];
        this._nodeSize = NodeSize.normal;
        this._savedMapLayers = [];
        this._selectedDate = Moment();
        this.lazyLoadLocalStorageVisibleLayers();
    }

    @computed
    get selectedTransitTypes() {
        return this._selectedTransitTypes;
    }

    @computed
    get selectedDate(): Moment.Moment | null {
        return this._selectedDate;
    }

    @action
    public setSelectedDate = (value: Moment.Moment | null) => {
        this._selectedDate = value;
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
            if (mapLayer === MapLayer.node || mapLayer === MapLayer.link) {
                _setLocalStorageLayerVisibility({ mapLayer, isVisible: false });
            }
        } else {
            this.showMapLayer(mapLayer);
            if (mapLayer === MapLayer.node || mapLayer === MapLayer.link) {
                _setLocalStorageLayerVisibility({ mapLayer, isVisible: true });
            }
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
        this._visibleMapLayers = this._visibleMapLayers.filter(mL => mL !== mapLayer);
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
            this._selectedTransitTypes = this._selectedTransitTypes.filter(t => t !== type);
        } else {
            // Need to do concat (instead of push) to trigger ReactionDisposer watcher
            this._selectedTransitTypes = this._selectedTransitTypes.concat([type]);
        }
    };

    @action
    public restoreSavedMapLayers() {
        this.setVisibleMapLayers(this._savedMapLayers);
        this._savedMapLayers = [];
    }

    @action
    public saveMapLayers() {
        this._savedMapLayers = this._visibleMapLayers;
    }

    // TODO: Remove this lazy load hack when map's initial position is immediately at target element after page reload
    private lazyLoadLocalStorageVisibleLayers = async () => {
        setTimeout(() => {
            const localStorageVisibleLayers = LocalStorageHelper.getItem('visible_layers');
            const layers: MapLayer[] = [];
            if (!Array.isArray(localStorageVisibleLayers)) return layers;

            if (localStorageVisibleLayers.includes('node')) {
                layers.push(MapLayer.node);
            }
            if (localStorageVisibleLayers.includes('link')) {
                layers.push(MapLayer.link);
            }
            this.setLocalStorageVisibleLayers(layers);
            return;
        }, 2000);
    };

    @action
    private setLocalStorageVisibleLayers = (layers: MapLayer[]) => {
        this._visibleMapLayers = layers;
    };
}

const _setLocalStorageLayerVisibility = ({
    mapLayer,
    isVisible
}: {
    mapLayer: MapLayer;
    isVisible: boolean;
}) => {
    if (mapLayer !== MapLayer.node && mapLayer !== MapLayer.link) {
        throw `Unsupported mapLayer: ${mapLayer}`;
    }
    const mapLayerName = mapLayer === MapLayer.node ? 'node' : 'link';
    const localStorageVisibleLayers = LocalStorageHelper.getItem('visible_layers');
    let layers: string[] = Array.isArray(localStorageVisibleLayers)
        ? localStorageVisibleLayers
        : [];
    if (isVisible) {
        if (!layers.includes(mapLayerName)) {
            layers.push(mapLayerName);
        }
    } else {
        layers = layers.filter(l => l !== mapLayerName);
    }
    LocalStorageHelper.setItem('visible_layers', layers);
};

const observableNetworkStore = new NetworkStore();

export default observableNetworkStore;
