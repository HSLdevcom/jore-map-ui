import { LatLng } from 'leaflet';
import { action, computed, observable } from 'mobx';
import CoordinateSystem from '../enums/coordinateSystem';
import GeometryService from '../services/geometryService';

export class MapStore {

    @observable private _coordinates: LatLng;
    @observable private _isMapFullscreen: boolean;
    @observable private _routes: MapRoute[];
    @observable private _displayCoordinateSystem:CoordinateSystem;

    constructor(
        coordinate = new LatLng(60.24, 24.9),
        isFullscreen = false,
    ) {
        this._coordinates = coordinate;
        this._isMapFullscreen = isFullscreen;
        this._routes = [];
        this._displayCoordinateSystem = CoordinateSystem.EPSG4326;
    }

    @computed get isMapFullscreen(): boolean {
        return this._isMapFullscreen;
    }

    @computed get routes(): MapRoute[] {
        return this._routes;
    }

    @computed get coordinates(): LatLng {
        return this._coordinates;
    }

    @computed get getDisplayCoordinates(): number[] {
        return GeometryService.reprojectToCrs(
            this._coordinates.lat, this._coordinates.lng, this._displayCoordinateSystem);
    }

    @action
    setCoordinatesFromDisplayCoordinateSystem(lat: number, lon: number) {
        const [wgsLat, wgsLon] = GeometryService.reprojectToCrs(
            lat, lon, CoordinateSystem.EPSG4326, this._displayCoordinateSystem);
        this._coordinates = new LatLng(wgsLat, wgsLon);
    }

    @action
    public setCoordinates(lat: number, lon: number) {
        this._coordinates = new LatLng(lat, lon);
    }

    @action
    public toggleMapFullscreen = () => {
        this._isMapFullscreen = !this._isMapFullscreen;
    }

    @computed
    get displayCoordinateSystem(): CoordinateSystem {
        return this._displayCoordinateSystem;
    }

    set displayCoordinateSystem(value: CoordinateSystem) {
        this._displayCoordinateSystem = value;
    }

    @action
    public cycleCoordinateSystem() {
        this._displayCoordinateSystem =
            GeometryService.nextCoordinateSystem(this._displayCoordinateSystem);
    }
}

const observableMapStore = new MapStore();

export default observableMapStore;
