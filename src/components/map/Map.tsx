import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { MapStore } from '../../stores/mapStore';
import { autorun } from 'mobx';
import classnames from 'classnames';
import { RouteStore } from '../../stores/routeStore';
import RouteLayerView from '../../layers/routeLayerView';
import { IRoute } from '../../models';
import * as s from './map.scss';
import FullscreenControl from './FullscreenControl';
import CoordinateControl from './CoordinateControl';
import MeasurementControl from './MeasurementControl';

interface IMapProps {
    mapStore?: MapStore;
    routeStore?: RouteStore;
}

@inject('mapStore')
@inject('routeStore')
@observer
class Map extends React.Component<IMapProps> {
    private map: L.Map;
    private routeLayerView: RouteLayerView;

    constructor(props: IMapProps) {
        super(props);
    }

    public componentDidMount() {
        this.initializeMap();
        autorun(() => this.updateMap());
        this.routeLayerView = new RouteLayerView(this.map);
        autorun(() => this.updateRouteLines());

        // const editableLayers = new L.FeatureGroup();
        // this.map.addLayer(editableLayers);
        // const drawPluginOptions:L.Control.DrawConstructorOptions = {
        //     position: 'topright',
        //     draw: {
        //         polygon: {
        //             allowIntersection: false, // Restricts shapes to simple polygons
        //             drawError: {
        //                 color: '#e1e100', // Color the shape will turn when intersects
        //                 message: '<strong>Oh snap!<strong> you t!', // Mes
        //             },
        //             shapeOptions: {
        //                 color: '#97009c',
        //             },
        //         },
        //         // disable toolbar item by setting it to false
        //         polyline: false,
        //         circle: false, // Turns off this drawing tool
        //         rectangle: false,
        //         marker: false,
        //     },
        //     edit: {
        //         featureGroup: editableLayers,
        //         remove: false,
        //     },
        // };
        // const drawControl = new L.Control.Draw(drawPluginOptions);
        // this.map.addControl(drawControl);
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
        this.map.addControl(new FullscreenControl({ position: 'bottomright' }));
        this.map.addControl(new CoordinateControl({ position: 'topright' }));
        this.map.addControl(new MeasurementControl({ position: 'topright' }));
        L.control.zoom({ position:'bottomright' }).addTo(this.map);
        this.map.on('moveend', this.setMapCenterAsCenter);
    }

    private updateMap = () => {
        if (!this.map.getCenter().equals(this.props.mapStore!.coordinates)) {
            this.map.flyTo(this.props.mapStore!.coordinates);
        }
    }

    private setMapCenterAsCenter = () =>
        this.props.mapStore!.setCoordinates(this.map.getCenter().lat, this.map.getCenter().lng)
}

export default Map;
