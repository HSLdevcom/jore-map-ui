import { LatLng } from 'leaflet';
import { action, computed, observable } from 'mobx';
import CoordinateSystem from '~/enums/coordinateSystem';
import GeometryService from '~/services/geometryService';

export enum NodeSize {
    normal,
    large,
}

export class MapStore {

    @observable private _coordinates: LatLng;
    @observable private _isMapFullscreen: boolean;
    @observable private _routes: MapRoute[];
    @observable private _displayCoordinateSystem:CoordinateSystem;
    @observable private _nodeSize:NodeSize;
    @observable private _isCreatingNewRoutePath: boolean;

    constructor(
        coordinate = new LatLng(60.24, 24.9),
        isFullscreen = false,
    ) {
        this._coordinates = coordinate;
        this._isMapFullscreen = isFullscreen;
        this._routes = [];
        this._displayCoordinateSystem = CoordinateSystem.EPSG4326;
        this._nodeSize = NodeSize.normal;
        this._isCreatingNewRoutePath = false;
    }

    @computed
    get coordinates(): LatLng {
        return this._coordinates;
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
    @computed get getDisplayCoordinates(): number[] {
        return GeometryService.reprojectToCrs(
            this._coordinates.lat, this._coordinates.lng, this._displayCoordinateSystem);
    }

    @computed get nodeSize(): NodeSize {
        return this._nodeSize;
    }

    @computed get isCreatingNewRoutePath(): boolean {
        return this._isCreatingNewRoutePath;
    }

    @action
    public setCoordinates(lat: number, lon: number) {
        this._coordinates = new LatLng(lat, lon);
    }

    @action
    public toggleMapFullscreen = () => {
        this._isMapFullscreen = !this._isMapFullscreen;
    }

    // TODO: move logic out of store? You can setCoordinates() instead
    @action
    setCoordinatesFromDisplayCoordinateSystem(lat: number, lon: number) {
        const [wgsLat, wgsLon] = GeometryService.reprojectToCrs(
            lat, lon, CoordinateSystem.EPSG4326, this._displayCoordinateSystem);
        this._coordinates = new LatLng(wgsLat, wgsLon);
    }

    set displayCoordinateSystem(value: CoordinateSystem) {
        this._displayCoordinateSystem = value;
    }

    // TODO: move logic out of store? You can use set displayCoordinates() instead
    @action
    public cycleCoordinateSystem() {
        this._displayCoordinateSystem =
            GeometryService.nextCoordinateSystem(this._displayCoordinateSystem);
    }

    @action
    setNodeSize(nodeSize: NodeSize) {
        this._nodeSize = nodeSize;
    }

    @action
    setIsCreatingNewRoutePath(isCreatingNewRoutePath: boolean) {
        this._isCreatingNewRoutePath = isCreatingNewRoutePath;
    }
}

const observableMapStore = new MapStore();

export default observableMapStore;
