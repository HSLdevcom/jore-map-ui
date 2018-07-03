import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {inject, observer} from 'mobx-react'
import * as React from 'react'
import fullScreenEnterIcon from '../icons/icon-fullscreen-enter.svg'
import fullScreenExitIcon from '../icons/icon-fullscreen-exit.svg'
import {MapStore} from '../stores/mapStore'
import './Map.css'


interface IMapProps {
  mapStore?: MapStore
}


const addControlButton = (map: L.Map, toggleFullscreen: () => void) => {
  const fullScreenControl = L.Control.extend({
    onAdd: () => {
      const icon = L.DomUtil.create('img')
      const container = L.DomUtil.create('button', 'leaflet-bar leaflet-control')
      icon.setAttribute('src', fullScreenEnterIcon)
      icon.setAttribute('height', '11')
      icon.setAttribute('width', '11')
      // container.className = styles.fullScreenButton
      container.appendChild(icon)
      container.onclick = () => {
        icon.setAttribute('src', toggleFullscreen() ? fullScreenExitIcon : fullScreenEnterIcon)
      }
      return container
    },
    options: {
      position: 'topleft',
    },
  })
  map.addControl(new fullScreenControl())
}

@inject('mapStore')
@observer
class Map extends React.Component<IMapProps> {
  private map: L.Map

  constructor(props: any) {
    super(props)
    this.initializeMap = this.initializeMap.bind(this)
    this.updateMap = this.updateMap.bind(this)
  }

  public componentDidMount() {
    this.initializeMap()
  }

  public componentWillReact() {
    this.updateMap()
    global.console.log('willreact', this.props.mapStore!.isFullscreen)
  }

  public initializeMap() {
    this.map = L.map('map-leaflet')
    this.map.setView(this.props.mapStore!.coordinates, 15)
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
    addControlButton(this.map, () => {
      this.props.mapStore!.toggleFullscreen()
    })
  }

  public render() {
    global.console.log(this.map !== undefined ? this.map.getContainer().classList : [])
    const classes = this.map !== undefined ? this.map.getContainer().classList : null
    if (classes !== null) {
      classes.remove('root')
      classes.remove('fullscreen')
    }
    return (
      <div
        id='map-leaflet'
        className={`${classes !== null ? classes.toString() : ''} root ${this.props.mapStore!.isFullscreen ? 'fullscreen' : ''}`}
      >
        Leaflet
      </div>
    )
  }

  private updateMap() {
    this.map.flyTo(this.props.mapStore!.coordinates)
  }
}

export default Map
