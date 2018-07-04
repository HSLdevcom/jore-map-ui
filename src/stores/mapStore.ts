import {LatLng} from 'leaflet'
import {action, observable} from 'mobx'

export class MapStore {
  @observable private coordinate: LatLng

  @action public setCoordinate(lat: number, lon: number) {
    this.coordinate = new LatLng(lat, lon)
  }

  public getCoordinate(): LatLng {
    return this.coordinate
  }
}

const observableMapStore = new MapStore()
observableMapStore.setCoordinate(60.24, 24.9)

export default observableMapStore