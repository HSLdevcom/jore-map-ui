import {LatLng} from 'leaflet'
import {action, computed, observable} from 'mobx'

export class MapStore {
    @observable private _coordinates: LatLng
    @observable private _isMapFullscreen: boolean
    @observable private _routes: MapRoute[]

    constructor(
        coordinate = new LatLng(60.24, 24.9),
        isFullscreen = false
    ) {
        this._coordinates = coordinate
        this._isMapFullscreen = isFullscreen
        this._routes = []
    }

    @computed get isMapFullscreen(): boolean {
        return this._isMapFullscreen
    }

    @computed get routes(): MapRoute[] {
        return this._routes
    }

    @computed get coordinates(): LatLng {
        return this._coordinates
    }

    @action
    public setCoordinates(lat: number, lon: number) {
        this._coordinates = new LatLng(lat, lon)
    }

    @action
    public toggleMapFullscreen = () => {
        this._isMapFullscreen = !this._isMapFullscreen
    }
}

const observableMapStore = new MapStore()

export default observableMapStore