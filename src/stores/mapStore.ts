import { LatLng } from 'leaflet';
import { action, computed, observable } from 'mobx';
import CoordinateSystem from '../enums/coordinateSystems';

export class MapStore {

    @observable private _coordinates: LatLng;
    @observable private _isMapFullscreen: boolean;
    @observable private _routes: MapRoute[];
    @observable private _coordinateSystem:CoordinateSystem;

    constructor(
        coordinate = new LatLng(60.24, 24.9),
        isFullscreen = false,
    ) {
        this._coordinates = coordinate;
        this._isMapFullscreen = isFullscreen;
        this._routes = [];
        this._coordinateSystem = CoordinateSystem.EPSG4326;
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

    @computed get lat(): number {
        return this._coordinates.lat;
    }

    set lat(lat: number) {
        this._coordinates.lat = lat;
    }

    @computed get lon(): number {
        return this._coordinates.lng;
    }

    set lon(lon: number) {
        this._coordinates.lng = lon;
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
    get coordinateSystem(): CoordinateSystem {
        return this._coordinateSystem;
    }

    set coordinateSystem(value: CoordinateSystem) {
        this._coordinateSystem = value;
    }
}

const observableMapStore = new MapStore();

export default observableMapStore;
