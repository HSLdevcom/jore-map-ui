import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { inject, observer } from 'mobx-react';
import { autorun, toJS } from 'mobx';
import * as React from 'react';
import fullScreenEnterIcon from '../../icons/icon-fullscreen-enter.svg';
import fullScreenExitIcon from '../../icons/icon-fullscreen-exit.svg';
import { MapStore } from '../../stores/mapStore';
import { RouteStore } from '../../stores/routeStore';
import RouteLayerView from '../../layers/routeLayerView';

interface IMapProps {
    mapStore?: MapStore;
    routeStore?: RouteStore;
}

@inject('mapStore')
@inject('routeStore')
@observer
class Map extends React.Component<IMapProps> {
    private map: L.Map;
    private lastCenter: L.LatLng;
    private routeLayerView: RouteLayerView;

    constructor(props: IMapProps) {
        super(props);
    }

    public componentDidMount() {
        this.initializeMap();
        this.routeLayerView = new RouteLayerView(this.map);
        autorun(() => this.updateRouteLines());
    }

    public componentWillReact() {
        this.updateMap();
    }

    private updateRouteLines() {
        this.routeLayerView.drawRouteLines(toJS(this.props.routeStore!.openRoutes));
    }

    public render() {
        const classes = this.map !== undefined ? this.map.getContainer().classList : null;
        if (classes !== null) {
            classes.remove('root');
            classes.remove('fullscreen');
        }
        return (
            <div
                id='map-leaflet'
                // tslint:disable-next-line:max-line-length
                className={`${classes !== null ? classes.toString() : ''} root ${this.props.mapStore!.isMapFullscreen ? 'fullscreen' : ''}`}
            />
        );
    }

    private initializeMap = () => {
        this.map = L.map('map-leaflet');
        this.lastCenter = this.props.mapStore!.coordinates;
        this.map.setView(this.props.mapStore!.coordinates, 15);
        // tslint:disable-next-line:max-line-length
        L.tileLayer('https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}{retina}.png', {
            // tslint:disable-next-line:max-line-length
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            baseLayer: true,
            maxZoom: 18,
            retina: L.Browser.retina ? '' : '@2x',
            tileSize: 512,
            zoomOffset: -1,
        }).addTo(this.map);
        this.map.addControl(this.fullscreenControlButton());
    }

    private fullscreenControlButton = () => {
        const fullscreenControl = new L.Control();
        fullscreenControl.onAdd = () => {
            const icon = L.DomUtil.create('img');
            const container = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
            icon.setAttribute('src', fullScreenEnterIcon);
            icon.className = 'fullscreenIcon';
            container.className = 'fullscreenButton';
            container.appendChild(icon);
            container.onclick = () => {
                this.props.mapStore!.toggleMapFullscreen();
                icon.setAttribute(
                    'src',
                    this.props.mapStore!.isMapFullscreen
                        ? fullScreenExitIcon : fullScreenEnterIcon);
            };
            return container;
        };
        fullscreenControl.options = { position: 'topleft' };
        return fullscreenControl;
    }

    private updateMap = () => {
        if (!this.lastCenter.equals(this.props.mapStore!.coordinates)) {
            this.map.flyTo(this.props.mapStore!.coordinates);
            this.lastCenter = new L.LatLng(
                this.props.mapStore!.coordinates.lat,
                this.props.mapStore!.coordinates.lng,
            );
        }
    }
}

export default Map;
