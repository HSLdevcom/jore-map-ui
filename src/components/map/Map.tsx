import { Map, TileLayer, ZoomControl } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classnames from 'classnames';
import { MapStore } from '../../stores/mapStore';
import { SidebarStore } from '../../stores/sidebarStore';
import { RouteStore } from '../../stores/routeStore';
import Control from './CustomControl';
import CoordinateControl from './CoordinateControl';
import FullscreenControl from './FullscreenControl';
import MeasurementControl from './MeasurementControl';
import RouteLayer from './RouteLayer';
import ColorScale from '../../util/colorScale';
import MarkerLayer from './MarkerLayer';
import { IRoutePath, INode, IRoute } from '../../models';
import MapLayersControl from './MapLayersControl';
import Toolbar from './toolbar/Toolbar';
import PopupLayer from './PopupLayer';
import * as s from './map.scss';

interface IMapState {
    zoomLevel: number;
}

interface IMapProps {
    mapStore?: MapStore;
    routeStore?: RouteStore;
    sidebarStore?: SidebarStore;
}

interface IMapPropReference {
    children: JSX.Element[];
    ref: any;
    center: L.LatLng;
    zoom: number;
    zoomControl: false;
    id: string;
}

@inject('sidebarStore', 'mapStore', 'routeStore')
@observer
class LeafletMap extends React.Component<IMapProps, IMapState> {
    private mapReference: React.RefObject<Map<IMapPropReference, L.Map>>;

    constructor(props: IMapProps) {
        super(props);
        this.mapReference = React.createRef();
        this.state = {
            zoomLevel: 15,
        };
        this.setView = this.setView.bind(this);
        this.fitBounds = this.fitBounds.bind(this);
        this.bringRouteLayerToFront = this.bringRouteLayerToFront.bind(this);
    }

    private getMap() {
        return this.mapReference.current!.leafletElement;
    }

    public componentDidMount() {
        const map = this.getMap();
        // TODO: Convert these as react-components
        map.addControl(new CoordinateControl({ position: 'topright' }));
        map.addControl(new MeasurementControl({ position: 'topright' }));
        map.on('moveend', () => {
            this.props.mapStore!.setCoordinates(
                map.getCenter().lat,
                map.getCenter().lng,
            );
        });
        map.on('zoomend', () => {
            this.setState({
                zoomLevel: map.getZoom(),
            });
        });
    }

    public componentDidUpdate() {
        this.getMap().invalidateSize();
    }

    private fitBounds(bounds: L.LatLngBoundsExpression) {
        this.getMap().fitBounds(bounds);
    }

    private bringRouteLayerToFront(internalId: string) {
        this.getMap().eachLayer((layer: any) => {
            if (layer.options.internalId === internalId) {
                layer.bringToFront();
            }
        });
    }

    private getVisibleRoutePaths = (routes: IRoute[]) => {
        return routes.reduce<IRoutePath[]>(
            (flatList, route) => {
                return flatList.concat(route.routePaths);
            },
            [],
        ).filter(routePath => routePath.visible);
    }

    private getVisibleNodes = (visibleRoutesPaths: IRoutePath[]) => {
        return visibleRoutesPaths.reduce<INode[]>(
            (flatList, routePath) => {
                return flatList.concat(routePath.nodes);
            },
            [],
        );
    }

    private startCoordinates(visibleRoutePaths: IRoutePath[]) {
        return visibleRoutePaths.map((routePath: IRoutePath) => routePath.geoJson.coordinates[0]);
    }

    /* Leaflet methods */
    private setView(latLng: L.LatLng) {
        this.getMap().setView(latLng, 17);
    }

    private sideBarWidthStyles() {
        if (this.props.mapStore!.isMapFullscreen) {
            return {
                width: '100%',
                left: '0',
            };
        }
        return {
            width: `calc(100vw - ${this.props.sidebarStore!.getSideBarWidth}px)`,
            left: this.props.sidebarStore!.getSideBarWidth,
        };
    }

    public render() {
        const fullScreenMapViewClass = (this.props.mapStore!.isMapFullscreen) ? s.fullscreen : '';
        const visibleRoutePaths = this.getVisibleRoutePaths(this.props.routeStore!.routes);
        const visibleNodes = this.getVisibleNodes(visibleRoutePaths);
        const colors = ColorScale.getColors(visibleRoutePaths.length);
        return (
            <div
                className={classnames(s.mapView, fullScreenMapViewClass)}
                style={this.sideBarWidthStyles()}
            >
                <Map
                    ref={this.mapReference}
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
                    <RouteLayer
                        colors={colors}
                        routePaths={visibleRoutePaths}
                        fitBounds={this.fitBounds}
                        bringRouteLayerToFront={this.bringRouteLayerToFront}
                    />
                    <MarkerLayer
                        nodes={visibleNodes}
                        firstNodes={this.startCoordinates(visibleRoutePaths)}
                    />
                    <PopupLayer
                        setView={this.setView}
                    />
                    <Control position='topleft'>
                        <Toolbar />
                    </Control>
                    <Control position='topright'>
                        <FullscreenControl />
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
