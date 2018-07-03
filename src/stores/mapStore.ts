import {LatLng} from 'leaflet'
import {action, computed, observable} from 'mobx'

export class MapStore {
  @observable private _coordinates: LatLng
  @observable private _isFullscreen: boolean
  @observable private _routes: MapRoute[]

  constructor(
    coordinate = new LatLng(60.24, 24.9),
    isFullscreen = false
  ) {
    this._coordinates = coordinate
    this._isFullscreen = isFullscreen
    this._routes = []
  }

  @computed get isFullscreen(): boolean {
    return this._isFullscreen
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
  public toggleFullscreen() {
    global.console.log(this._isFullscreen)
    this._isFullscreen = !this._isFullscreen
  }
}

const observableMapStore = new MapStore()

export default observableMapStore