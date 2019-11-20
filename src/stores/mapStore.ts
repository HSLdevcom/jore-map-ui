import * as L from 'leaflet';
import { action, computed, observable } from 'mobx';
import CoordinateSystem from '~/enums/coordinateSystem';
import GeometryService from '~/services/geometryService';

const INITIAL_COORDINATES = new L.LatLng(60.1699, 24.9384);
const INITIAL_ZOOM = 15;

export enum NodeLabel {
    hastusId,
    longNodeId,
    shortNodeId
}

export enum MapFilter {
    arrowDecorator
}

export type MapCursor = '' | 'crosshair';

export class MapStore {
    @observable private _coordinates: L.LatLng | null;
    @observable private _displayCoordinateSystem: CoordinateSystem;
    @observable private _isMapFullscreen: boolean;
    @observable private _zoom: number;
    @observable private _selectedNodeId: string | null;
    @observable private _visibleNodeLabels: NodeLabel[];
    @observable private _mapFilters: MapFilter[];
    @observable private _mapBounds: L.LatLngBounds;
    @observable private _mapCursor: MapCursor;
    @observable private _isMapCenteringPrevented: boolean;

    constructor() {
        this._coordinates = null;
        this._displayCoordinateSystem = CoordinateSystem.EPSG4326;
        this._zoom = INITIAL_ZOOM;
        this._isMapFullscreen = false;
        this._visibleNodeLabels = [NodeLabel.hastusId];
        this._mapFilters = [MapFilter.arrowDecorator];
        this._mapCursor = '';
        this._isMapCenteringPrevented = false;
    }

    @computed
    get coordinates(): L.LatLng | null {
        return this._coordinates;
    }

    @computed
    get displayCoordinateSystem(): CoordinateSystem {
        return this._displayCoordinateSystem;
    }

    @computed
    get zoom(): number {
        return this._zoom;
    }

    @computed
    get isMapFullscreen(): boolean {
        return this._isMapFullscreen;
    }

    @computed
    get selectedNodeId() {
        return this._selectedNodeId;
    }

    @computed
    get visibleNodeLabels() {
        return this._visibleNodeLabels;
    }

    @computed
    get mapBounds() {
        return this._mapBounds;
    }

    @computed
    get mapCursor() {
        return this._mapCursor;
    }

    @computed
    get isMapCenteringPrevented() {
        return this._isMapCenteringPrevented;
    }

    public isMapFilterEnabled = (mapFilter: MapFilter) => {
        return this._mapFilters.includes(mapFilter);
    };

    @action
    public setMapBounds = (bounds: L.LatLngBounds) => {
        this._mapBounds = bounds;
    };

    @action
    public setCoordinates = (location: L.LatLng | null) => {
        this._coordinates = location;
    };

    @action
    public setZoom = (zoom: number) => {
        this._zoom = zoom;
    };

    @action
    public setInitCoordinates = () => {
        this._coordinates = INITIAL_COORDINATES;
    };

    @action
    public toggleMapFullscreen = () => {
        this._isMapFullscreen = !this._isMapFullscreen;
    };

    // TODO: move logic out of store? You can setCoordinates() instead
    @action
    public setCoordinatesFromDisplayCoordinateSystem = (lat: number, lon: number) => {
        const [wgsLat, wgsLon] = GeometryService.reprojectToCrs(
            lat,
            lon,
            CoordinateSystem.EPSG4326,
            this._displayCoordinateSystem
        );
        this._coordinates = new L.LatLng(wgsLat, wgsLon);
    };

    @action
    public setDisplayCoordinateSystem = (value: CoordinateSystem) => {
        this._displayCoordinateSystem = value;
    };

    @action
    public setSelectedNodeId = (id: string | null) => {
        this._selectedNodeId = id;
    };

    @action
    public setIsMapCenteringPrevented = (isPrevented: boolean) => {
        this._isMapCenteringPrevented = isPrevented;
    };

    @action
    public toggleNodeLabelVisibility = (nodeLabel: NodeLabel) => {
        if (this._visibleNodeLabels.includes(nodeLabel)) {
            this._visibleNodeLabels = this._visibleNodeLabels.filter(t => t !== nodeLabel);
        } else {
            // Need to do concat (instead of push) to trigger observable reaction
            this._visibleNodeLabels = this._visibleNodeLabels.concat([nodeLabel]);
        }
    };

    @action
    public toggleMapFilter = (mapFilter: MapFilter) => {
        if (this._mapFilters.includes(mapFilter)) {
            this._mapFilters = this._mapFilters.filter(mF => mF !== mapFilter);
        } else {
            // Need to do concat (instead of push) to trigger observable reaction
            this._mapFilters = this._mapFilters.concat([mapFilter]);
        }
    };

    @action
    public setMapCursor = (mapCursor: MapCursor) => {
        this._mapCursor = mapCursor;
    };

    public isNodeLabelVisible = (nodeLabel: NodeLabel) => {
        return this._visibleNodeLabels.includes(nodeLabel);
    };
}

const observableMapStore = new MapStore();

export default observableMapStore;
