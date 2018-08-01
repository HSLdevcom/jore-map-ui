import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import fullScreenEnterIcon from '../../icons/icon-fullscreen-enter.svg';
import fullScreenExitIcon from '../../icons/icon-fullscreen-exit.svg';
import { MapStore } from '../../stores/mapStore';
import { autorun } from 'mobx';
import { RouteStore } from '../../stores/routeStore';
import RouteLayerView from '../../layers/routeLayerView';
import * as s from './map.scss';
import CoordinateSystem from '../../enums/coordinateSystems';

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
    private coordinateControl: L.Control;
    private xInput: HTMLInputElement;
    private yInput: HTMLInputElement;
    private xButton: HTMLElement;
    private yButton: HTMLElement;
    private routeLayerView: RouteLayerView;

    constructor(props: IMapProps) {
        super(props);
    }

    public componentDidMount() {
        this.initializeMap();
        autorun(() => this.updateMap());
        autorun(() => this.updateMap());
        this.routeLayerView = new RouteLayerView(this.map);
        autorun(() => this.updateRouteLines());
    }

    private updateRouteLines() {
        this.routeLayerView.drawRouteLines(this.props.routeStore!.openRoutes);
    }

    public render() {
        const classes = this.map !== undefined ? this.map.getContainer().classList : null;
        if (classes !== null) {
            classes.remove('root');
            classes.remove(s.fullscreen);
        }
        return (
            <div
                id={s.mapLeaflet}
                // tslint:disable-next-line:max-line-length
                className={`${classes !== null ? classes.toString() : ''} root ${this.props.mapStore!.isMapFullscreen ? s.fullscreen : ''}`}
            />
        );
    }

    private initializeMap = () => {
        this.map = L.map(s.mapLeaflet, { zoomControl: false });
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
        this.coordinateControl = this.coordinateControlBox();
        this.map.addControl(this.coordinateControl);
        L.control.zoom({ position:'bottomright' }).addTo(this.map);
        this.map.on('moveend', this.setMapCenterAsCenter);
    }

    private fullscreenControlButton = () => {
        const fullscreenControl = new L.Control();
        fullscreenControl.onAdd = () => {
            const icon = L.DomUtil.create('img');
            const container = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
            container.id = 'fullscreenControl';
            icon.setAttribute('src', fullScreenEnterIcon);
            icon.className = s.fullscreenButton;
            container.className = s.fullscreenButton;
            container.appendChild(icon);
            container.onclick = () => {
                this.props.mapStore!.toggleMapFullscreen();
                icon.setAttribute(
                    'src',
                    this.props.mapStore!.isMapFullscreen
                        ? fullScreenExitIcon : fullScreenEnterIcon);
                this.map.invalidateSize();
            };
            L.DomEvent.disableClickPropagation(container);
            return container;
        };
        fullscreenControl.options = { position: 'bottomright' };
        return fullscreenControl;
    }

    private coordinateControlBox = () => {
        const coordinateControl = new L.Control();
        coordinateControl.onAdd = () => {
            const [lat, lon] = CoordinateSystem
                .convertToCoordinateSystem(this.props.mapStore!.lat,
                                           this.props.mapStore!.lon,
                                           this.props.mapStore!.coordinateSystem);
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            container.id = 'coordinateControl';
            const xDiv = L.DomUtil.create('div');
            this.xButton = L.DomUtil.create('button');
            this.xButton.innerText = 'Lat';
            this.xInput = L.DomUtil.create('input', '') as HTMLInputElement;
            this.xInput.id = 'xcoord';
            xDiv.appendChild(this.xButton);
            xDiv.appendChild(this.xInput);
            this.xInput.value = lat.toString(10);

            const yDiv = L.DomUtil.create('div');
            this.yButton = L.DomUtil.create('button');
            this.yButton.innerText = 'Lon';
            this.yInput = L.DomUtil.create('input', '') as HTMLInputElement;
            this.yInput.id = 'ycoord';
            yDiv.appendChild(this.yButton);
            yDiv.appendChild(this.yInput);
            container.appendChild(xDiv);
            container.appendChild(yDiv);
            this.yInput.value = lon.toString(10);

            this.xInput.onblur = this.yInput.onblur = (e) => {
                const newX = Number(this.xInput.value);
                const newY = Number(this.yInput.value);
                if (!isNaN(newY) && !isNaN(newX)) {
                    this.setInputAsCenter(newX, newY);
                }
            };
            this.xButton.onclick = this.yButton.onclick = () => {
                this.props.mapStore!.coordinateSystem =
                    CoordinateSystem.nextCoordinateSystem(this.props.mapStore!.coordinateSystem);
            };
            L.DomEvent.disableClickPropagation(container);
            return container;
        };
        return coordinateControl;
    }

    private updateMap = () => {
        [this.xInput.value, this.yInput.value] = CoordinateSystem
            .convertToCoordinateSystem(this.props.mapStore!.lat,
                                       this.props.mapStore!.lon,
                                       this.props.mapStore!.coordinateSystem)
            .map(val => val.toString(10));
        ({ x: this.xButton.innerText, y: this.yButton.innerText } =
            CoordinateSystem.coordinateNames(this.props.mapStore!.coordinateSystem));
        if (!this.lastCenter.equals(this.props.mapStore!.coordinates)) {
            this.map.flyTo(this.props.mapStore!.coordinates);
            this.lastCenter = new L.LatLng(
                this.props.mapStore!.coordinates.lat,
                this.props.mapStore!.coordinates.lng,
            );
        }
    }

    private setMapCenterAsCenter = () =>
        this.props.mapStore!.setCoordinates(this.map.getCenter().lat, this.map.getCenter().lng)

    private setInputAsCenter = (lat: number, lon: number) => {
        const [latt, lonn] =
            CoordinateSystem.convertToCoordinateSystem(
                lat, lon, CoordinateSystem.EPSG4326, this.props.mapStore!.coordinateSystem);
        this.props.mapStore!.setCoordinates(latt, lonn);
    }
}

export default Map;
