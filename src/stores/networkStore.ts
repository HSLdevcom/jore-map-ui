import { action, computed, observable } from 'mobx';
import Moment from 'moment';
import TransitType from '~/enums/transitType';
import LocalStorageHelper from '~/helpers/LocalStorageHelper';

const TRANSIT_TYPES = [
    TransitType.BUS,
    TransitType.FERRY,
    TransitType.SUBWAY,
    TransitType.TRAIN,
    TransitType.TRAM
];

enum NodeSize {
    normal,
    large
}

enum MapLayer { // TODO change name to something better
    node = 'node',
    link = 'link',
    linkPoint = 'linkPoint',
    unusedNode = 'unusedNode',
    unusedLink = 'unusedLink'
}

class NetworkStore {
    @observable private _selectedTransitTypes: TransitType[];
    @observable private _selectedDate: Moment.Moment | null;
    @observable private _visibleMapLayers: MapLayer[];
    @observable private _nodeSize: NodeSize;
    private _savedMapLayers: MapLayer[];

    constructor() {
        this._selectedTransitTypes = TRANSIT_TYPES;
        this._visibleMapLayers = this.getInitialVisibleMapLayers();
        this._nodeSize = NodeSize.normal;
        this._savedMapLayers = [];
        this._selectedDate = Moment();
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
            _setLocalStorageLayerVisibility({ mapLayer, isVisible: false });
        } else {
            this.showMapLayer(mapLayer);
            _setLocalStorageLayerVisibility({ mapLayer, isVisible: true });
        }
    };

    @action
    public showMapLayer = (mapLayer: MapLayer) => {
        // Need to do concat (instead of push) to trigger observable reaction
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
            // Need to do concat (instead of push) to trigger observable reaction
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

    private getInitialVisibleMapLayers = () => {
        const localStorageVisibleLayers = LocalStorageHelper.getItem('visible_layers');
        const layers: MapLayer[] = [];
        if (!Array.isArray(localStorageVisibleLayers)) return [];

        if (localStorageVisibleLayers.includes('node')) {
            layers.push(MapLayer.node);
        }
        if (localStorageVisibleLayers.includes('link')) {
            layers.push(MapLayer.link);
        }
        if (localStorageVisibleLayers.includes('unusedNode')) {
            layers.push(MapLayer.unusedNode);
        }
        if (localStorageVisibleLayers.includes('unusedLink')) {
            layers.push(MapLayer.unusedLink);
        }
        return layers;
    };
}

const _setLocalStorageLayerVisibility = ({
    mapLayer,
    isVisible
}: {
    mapLayer: MapLayer;
    isVisible: boolean;
}) => {
    if (mapLayer === 'linkPoint') {
        return;
    }

    const localStorageVisibleLayers = LocalStorageHelper.getItem('visible_layers');
    let layers: string[] = Array.isArray(localStorageVisibleLayers)
        ? localStorageVisibleLayers
        : [];
    if (isVisible) {
        if (!layers.includes(mapLayer)) {
            layers.push(mapLayer);
        }
    } else {
        layers = layers.filter(l => l !== mapLayer);
    }
    LocalStorageHelper.setItem('visible_layers', layers);
};

export default new NetworkStore();

export { NetworkStore, NodeSize, MapLayer };
