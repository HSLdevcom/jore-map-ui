import * as L from 'leaflet';
import { action, computed, observable } from 'mobx';
import CoordinateSystem from '~/enums/coordinateSystem';
import GeometryService from '~/services/geometryService';

const INITIAL_COORDINATES = new L.LatLng(
    60.1699,
    24.9384,
);
const INITIAL_ZOOM = 15;

export enum NodeLabel {
    hastusId,
    longNodeId,
    shortNodeId,
}

export class MapStore {

    @observable private _coordinates: L.LatLng;
    @observable private _isMapFullscreen: boolean;
    @observable private _routes: MapRoute[];
    @observable private _displayCoordinateSystem:CoordinateSystem;
    @observable private _zoom:number;
    @observable private _selectedNodeId: string|null;
    @observable private _visibleNodeLabels: NodeLabel[];
    @observable private _mapBounds: L.LatLngBounds;

    constructor() {
        this._coordinates = INITIAL_COORDINATES;
        this._zoom = INITIAL_ZOOM;
        this._isMapFullscreen = false;
        this._routes = [];
        this._displayCoordinateSystem = CoordinateSystem.EPSG4326;
        this._visibleNodeLabels = [
            NodeLabel.hastusId,
        ];
    }

    @computed
    get coordinates(): L.LatLng {
        return this._coordinates;
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
    get routes(): MapRoute[] {
        return this._routes;
    }

    @computed
    get displayCoordinateSystem(): CoordinateSystem {
        return this._displayCoordinateSystem;
    }

    // TODO: move this out of store
    // Use get coordinates() and get displayCoordinateSystem() instead.
    @computed
    get getDisplayCoordinates(): number[] {
        return GeometryService.reprojectToCrs(
            this._coordinates.lat, this._coordinates.lng, this._displayCoordinateSystem);
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

    @action
    public setMapBounds = (bounds: L.LatLngBounds) => {
        this._mapBounds = bounds;
    }

    @action
    public setCoordinates = (lat: number, lon: number) => {
        this._coordinates = new L.LatLng(lat, lon);
    }

    @action
    public setZoom = (zoom: number) => {
        this._zoom = zoom;
    }

    @action
    public toggleMapFullscreen = () => {
        this._isMapFullscreen = !this._isMapFullscreen;
    }

    // TODO: move logic out of store? You can setCoordinates() instead
    @action
    public setCoordinatesFromDisplayCoordinateSystem = (lat: number, lon: number) => {
        const [wgsLat, wgsLon] = GeometryService.reprojectToCrs(
            lat, lon, CoordinateSystem.EPSG4326, this._displayCoordinateSystem);
        this._coordinates = new L.LatLng(wgsLat, wgsLon);
    }

    @action
    public setDisplayCoordinateSystem = (value: CoordinateSystem) => {
        this._displayCoordinateSystem = value;
    }

    @action
    public setSelectedNodeId = (id: string|null) => {
        this._selectedNodeId = id;
    }

    @action
    public toggleNodeLabelVisibility = (nodeLabel: NodeLabel) => {
        if (this._visibleNodeLabels.includes(nodeLabel)) {
            this._visibleNodeLabels = this._visibleNodeLabels.filter(t => t !== nodeLabel);
        } else {
            // Need to do concat (instead of push) to trigger ReactionDisposer watcher
            this._visibleNodeLabels = this._visibleNodeLabels.concat([nodeLabel]);
        }
    }

    public isNodeLabelVisible = (nodeLabel: NodeLabel) => {
        return this._visibleNodeLabels.includes(nodeLabel);
    }

}

const observableMapStore = new MapStore();

export default observableMapStore;
