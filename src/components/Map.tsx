import * as L from 'leaflet'
import {LatLng} from 'leaflet'
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

@inject('mapStore')
@observer
class Map extends React.Component<IMapProps> {
    private map: L.Map
    private lastCenter: LatLng

    constructor(props: any) {
        super(props)
    }

    public componentDidMount() {
        this.initializeMap()
    }

    public componentWillReact() {
        this.updateMap()
    }

    public render() {
        const classes = this.map !== undefined ? this.map.getContainer().classList : null
        if (classes !== null) {
            classes.remove('root')
            classes.remove('fullscreen')
        }
        return (
            <div
                id='map-leaflet'
                className={`${classes !== null ? classes.toString() : ''} root ${this.props.mapStore!.isMapFullscreen ? 'fullscreen' : ''}`}
            >
                Leaflet
            </div>
        )
    }

    private initializeMap = () => {
        this.map = L.map('map-leaflet')
        this.lastCenter = this.props.mapStore!.coordinates
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
        this.map.addControl(this.fullscreenControlButton(this.props.mapStore!.toggleMapFullscreen))
    }

    private updateMap = () => {
        if (!this.lastCenter.equals(this.props.mapStore!.coordinates)) {
            this.map.flyTo(this.props.mapStore!.coordinates)
            this.lastCenter = new LatLng(this.props.mapStore!.coordinates.lat, this.props.mapStore!.coordinates.lng)
        }
    }

    private fullscreenControlButton = (toggleFullscreen: () => void) => {
        const fullscreenControl = new L.Control()
        fullscreenControl.onAdd = () => {
            const icon = L.DomUtil.create('img')
            const container = L.DomUtil.create('button', 'leaflet-bar leaflet-control')
            icon.setAttribute('src', fullScreenEnterIcon)
            icon.className = 'fullscreenIcon'
            container.className = 'fullscreenButton'
            container.appendChild(icon)
            container.onclick = () => {
                icon.setAttribute('src', toggleFullscreen() ? fullScreenExitIcon : fullScreenEnterIcon)
            }
            return container
        }
        fullscreenControl.options = {position: 'topleft'}
        return fullscreenControl
    }
}

export default Map
