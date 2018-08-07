import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import fullScreenEnterIcon from '../../icons/icon-fullscreen-enter.svg';
import fullScreenExitIcon from '../../icons/icon-fullscreen-exit.svg';
import { MapStore } from '../../stores/mapStore';
import { autorun } from 'mobx';
import GeometryService from '../../services/geometryService';
import classnames from 'classnames';
import { RouteStore } from '../../stores/routeStore';
import RouteLayerView from '../../layers/routeLayerView';
import { IRoute } from '../../models';
import * as s from './map.scss';

interface IMapProps {
    mapStore?: MapStore;
    routeStore?: RouteStore;
}

@inject('mapStore')
@inject('routeStore')
@observer
class Map extends React.Component<IMapProps> {
    private map: L.Map;
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
        this.routeLayerView = new RouteLayerView(this.map);
        autorun(() => this.updateRouteLines());
    }

    private updateRouteLines() {
        this.routeLayerView.drawRouteLines(this.props.routeStore!.routes);
        this.centerMapToRoutes(this.props.routeStore!.routes);
    }

    private centerMapToRoutes(routes: IRoute[]) {
        let bounds:L.LatLngBounds = new L.LatLngBounds([]);
        if (routes && routes[0]) {
            if (routes[0].routePaths[0]) {
                routes[0].routePaths.map((routePath) => {
                    const geoJSON = new L.GeoJSON(routePath.geoJson);
                    if (!bounds) {
                        bounds = geoJSON.getBounds();
                    } else {
                        bounds.extend(geoJSON.getBounds());
                    }
                });
                this.map.fitBounds(bounds);
            }
        }
    }

    public render() {
        const classes = this.map !== undefined ? this.map.getContainer().classList : null;
        if (classes !== null) {
            classes.remove('root');
            classes.remove(s.fullscreen);
        }
        return (
            <div>
                <div
                    id={s.mapLeaflet}
                    // tslint:disable-next-line:max-line-length
                    className={classnames(classes !== null ? classes.toString() : '', 'root', this.props.mapStore!.isMapFullscreen ? s.fullscreen : '')}
                />
            </div>
        );
    }

    private initializeMap = () => {
        this.map = L.map(s.mapLeaflet, { zoomControl: false });
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
        this.map.addControl(new this.fullscreenControlButton());
        this.map.addControl(new this.coordinateControl());
        L.control.zoom({ position:'bottomright' }).addTo(this.map);
        this.map.on('moveend', this.setMapCenterAsCenter);
    }

    private fullscreenControlButton = L.Control.extend({
        options: {
            position: 'bottomright',
        },
        onAdd: () => {
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
        },
    });

    private coordinateControl = L.Control.extend({
        options: {
            position: 'topright',
        },
        onAdd: () => {
            const [lat, lon] = this.props.mapStore!.getDisplayCoordinates;
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            container.id = s.coordinateControl;
            const xDiv = L.DomUtil.create('div');
            this.xButton = L.DomUtil.create('button');
            this.xButton.innerText = 'Lat';
            this.xInput = L.DomUtil.create('input', '') as HTMLInputElement;
            this.xInput.id = 'xcoord';
            this.xInput.tabIndex = 1;
            xDiv.appendChild(this.xButton);
            xDiv.appendChild(this.xInput);
            this.xInput.value = lat.toString(10);

            const yDiv = L.DomUtil.create('div');
            this.yButton = L.DomUtil.create('button');
            this.yButton.innerText = 'Lon';
            this.yInput = L.DomUtil.create('input', '') as HTMLInputElement;
            this.yInput.id = 'ycoord';
            this.yInput.tabIndex = 2;
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
            this.xInput.onkeypress = this.yInput.onkeypress = (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    this.xInput.blur();
                    this.yInput.blur();
                }
            };
            this.xButton.onclick = this.yButton.onclick = () => {
                this.props.mapStore!.cycleCoordinateSystem();
            };
            L.DomEvent.disableClickPropagation(container);
            return container;
        },
    });

    private updateMap = () => {
        [this.xInput.value, this.yInput.value] =
            this.props.mapStore!.getDisplayCoordinates.map(coord => coord.toString(10));
        ({ x: this.xButton.innerText, y: this.yButton.innerText } =
            GeometryService.coordinateNames(this.props.mapStore!.displayCoordinateSystem));
        if (!this.map.getCenter().equals(this.props.mapStore!.coordinates)) {
            this.map.flyTo(this.props.mapStore!.coordinates);
        }
    }

    private setMapCenterAsCenter = () =>
        this.props.mapStore!.setCoordinates(this.map.getCenter().lat, this.map.getCenter().lng)

    private setInputAsCenter = (lat: number, lon: number) => {
        this.props.mapStore!.setCoordinatesFromDisplayCoordinateSystem(lat, lon);
    }
}

export default Map;
