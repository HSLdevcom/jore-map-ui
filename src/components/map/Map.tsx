import { Map, MapProps, TileLayer, ZoomControl } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { MapStore } from '../../stores/mapStore';
import { SidebarStore } from '../../stores/sidebarStore';
import classnames from 'classnames';
import { RouteStore } from '../../stores/routeStore';
import Control from './CustomControl';
import CoordinateControl from './CoordinateControl';
import FullscreenControl from './FullscreenControl';
import MeasurementControl from './MeasurementControl';
import RouteLayer from './RouteLayer';
import ColorScale from '../../util/colorScale';
import NodeLayer from './NodeLayer';
import { IRoutePath, INode, IRoute } from '../../models';
import MapLayersControl from './MapLayersControl';
import * as s from './map.scss';
import Toolbar from './Toolbar';
import PopupLayer from './PopupLayer';
import { ToolbarStore } from '../../stores/toolbarStore';

interface IMapState {
    zoomLevel: number;
}

interface IMapProps {
    mapStore?: MapStore;
    routeStore?: RouteStore;
    sidebarStore?: SidebarStore;
    toolbarStore?: ToolbarStore;
}

@inject('sidebarStore', 'mapStore', 'routeStore', 'toolbarStore')
@observer
class LeafletMap extends React.Component<IMapProps, IMapState> {
    private map: Map<MapProps, L.Map> | null;

    constructor(props: IMapProps) {
        super(props);
        this.state = {
            zoomLevel: 15,
        };
        this.setView = this.setView.bind(this);
        this.fitBounds = this.fitBounds.bind(this);
    }

    public componentDidMount() {
        const leafletElement = this.map!.leafletElement;
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

    public componentDidUpdate() {
        this.map!.leafletElement.invalidateSize();
    }

    private fitBounds(bounds: L.LatLngBoundsExpression) {
        if (this.map) {
            this.map!.leafletElement.fitBounds(bounds);
        }
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

    private getFirstNodes() {
        const firstNodes: number[] = [];
        this.props.routeStore!.routes.forEach((route: IRoute) => {
            route.routePaths.forEach((routePath: IRoutePath) => {
                if (routePath.visible) {
                    firstNodes.push(routePath.geoJson.coordinates[0]);
                }
            });
        });
        return firstNodes;
    }

    /* Leaflet methods */
    private setView(latLng: L.LatLng) {
        if (this.map) {
            this.map!.leafletElement.setView(latLng, 17);
        }
    }

    public render() {
        const fullScreenMapViewClass = (this.props.mapStore!.isMapFullscreen) ? s.fullscreen : '';
        const visibleRoutePaths = this.getVisibleRoutePaths(this.props.routeStore!.routes);
        const visibleNodes = this.getVisibleNodes(visibleRoutePaths);
        const colors = ColorScale.getColors(visibleRoutePaths.length);
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
                    <RouteLayer
                        colors={colors}
                        routePaths={visibleRoutePaths}
                        fitBounds={this.fitBounds}
                    />
                    <NodeLayer
                        nodes={visibleNodes}
                        firstNodes={this.getFirstNodes()}
                    />
                    <PopupLayer
                        setView={this.setView}
                    />
                    <Control position='topleft'>
                        <Toolbar toolbarStore={this.props.toolbarStore}/>
                    </Control>
                    <Control position='topright'>
                        <FullscreenControl map={this.map} />
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
