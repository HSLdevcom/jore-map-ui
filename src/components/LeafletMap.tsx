import * as L from 'leaflet'
import {LatLng} from 'leaflet'
import 'leaflet/dist/leaflet.css'
import * as React from 'react'
import './LeafletMap.css'

interface ILeafletMapProps {
  center?: LatLng
}

class LeafletMap extends React.Component<ILeafletMapProps> {
  private map: L.Map
  constructor(props: ILeafletMapProps) {
    super(props)
    this.initializeMap = this.initializeMap.bind(this)
  }

  public componentDidMount() {
    this.initializeMap()
  }

  public componentDidUpdate() {
    this.map.flyTo(this.props.center!)
  }

  public initializeMap() {
    this.map = L.map('map-leaflet')
    this.map.setView(this.props.center!, 15)
    L.tileLayer('https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}{retina}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      baseLayer: true,
      maxZoom: 18,
      retina: L.Browser.retina ? '' : '@2x',
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(this.map)
  }

  public render(): any {
    return (
      <div id='map-leaflet'>
        Leaflet
      </div>
    )
  }
}

export default LeafletMap
