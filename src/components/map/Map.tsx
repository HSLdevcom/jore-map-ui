import { Map, TileLayer, ZoomControl } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { MapStore } from '../../stores/mapStore';
import { SidebarStore } from '../../stores/sidebarStore';
import { autorun } from 'mobx';
import classnames from 'classnames';
import { RouteStore } from '../../stores/routeStore';
import Control from './CustomControl';
import CoordinateControl from './CoordinateControl';
import FullscreenControl from './FullscreenControl';
import MeasurementControl from './MeasurementControl';
import MapLayersControl from './MapLayersControl';
import RouteLayerView from '../../layers/routeLayerView';
import { IRoute } from '../../models';
import * as s from './map.scss';
import Toolbar from './Toolbar';

interface IMapState {
    map?: L.Map;
    zoomLevel: number;
}

interface IMapProps {
    mapStore?: MapStore;
    routeStore?: RouteStore;
    sidebarStore?: SidebarStore;
}

@inject('sidebarStore')
@inject('mapStore')
@inject('routeStore')
@observer
class LeafletMap extends React.Component<IMapProps, IMapState> {
    private map: Map | null;
    private routeLayerView: RouteLayerView;

    constructor(props: IMapProps) {
        super(props);
        this.state = {
            map: undefined,
            zoomLevel: 15,
        };
    }

    public componentDidMount() {
        autorun(() => this.updateRouteLines());
        if (!this.state.map && this.map) {
            const leafletElement = this.map.leafletElement;
            this.setState({
                map: leafletElement,
            });
            // TODO: Convert these as react-components
            leafletElement.addControl(new CoordinateControl({ position: 'topright' }));
            leafletElement.addControl(new MeasurementControl({ position: 'topright' }));
            leafletElement.on('moveend', () => {
                this.props.mapStore!.setCoordinates(
                    leafletElement.getCenter().lat,
                    leafletElement.getCenter().lng,
                );
            });
            leafletElement.on('zoomend', () => {
                this.setState({
                    zoomLevel: leafletElement.getZoom(),
                });
            });
        }
    }

    public componentDidUpdate() {
        this.state.map!.invalidateSize();
    }

    private updateRouteLines() {
        if (this.map) {
            if (!this.routeLayerView) {
                this.routeLayerView = new RouteLayerView(this.map.leafletElement);
            }
            this.routeLayerView.drawRouteLines(this.props.routeStore!.routes);
            this.centerMapToRoutes(this.props.routeStore!.routes);
        }
    }

    private centerMapToRoutes(routes: IRoute[]) {
        let bounds:L.LatLngBounds = new L.LatLngBounds([]);
        if (routes && routes[0]) {
            routes.forEach((route: IRoute) => {
                if (route.routePaths[0]) {
                    route.routePaths.map((routePath) => {
                        if (!routePath.visible) return;
                        const geoJSON = new L.GeoJSON(routePath.geoJson);
                        if (!bounds) {
                            bounds = geoJSON.getBounds();
                        } else {
                            bounds.extend(geoJSON.getBounds());
                        }
                    });
                }
            });
            this.map!.leafletElement.fitBounds(bounds);
        }
    }

    public render() {
        const fullScreenMapViewClass = (this.props.mapStore!.isMapFullscreen) ? s.fullscreen : '';
        return (
            <div className={classnames(s.mapView, fullScreenMapViewClass)}>
                <Map
                    ref={(map) => {
                        this.map = map;
                    }}
                    center={this.props.mapStore!.coordinates}
                    zoom={this.state.zoomLevel}
                    zoomControl={false}
                    id={s.mapLeaflet}
                >
                    <TileLayer
                        // tslint:disable:max-line-length
                        url='https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}.png'
                        attribution={
                            `
                                Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,
                                <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>
                                Imagery © <a href="http://mapbox.com">Mapbox</a>
                                />
                            `
                        }
                        baseLayer={true}
                        maxZoom={18}
                        detectRetina={true}
                        tileSize={512}
                        zoomOffset={-1}
                        // tslint:enable:max-line-length
                    />
                    <Control position='topleft'>
                        <Toolbar />
                    </Control>
                    <Control position='topright'>
                        <FullscreenControl map={this.state.map} />
                    </Control>
                    <ZoomControl position='bottomright' />
                    <Control position='bottomright' />
                    <Control position='bottomleft'>
                        <MapLayersControl />
                    </Control>
                </Map>
            </div>
        );
    }
}

export default LeafletMap;
