import { LayerContainer, Map, TileLayer, ZoomControl } from 'react-leaflet';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classnames from 'classnames';
import 'leaflet/dist/leaflet.css';
import { MapStore } from '../../stores/mapStore';
import { RouteStore } from '../../stores/routeStore';
import Control from './mapControls/CustomControl';
import CoordinateControl from './mapControls/CoordinateControl';
import FullscreenControl from './mapControls/FullscreenControl';
import RouteLayer from './layers/RouteLayer';
import ColorScale from '../../util/colorScale';
import MarkerLayer from './layers/MarkerLayer';
import { IRoutePath, IRoute } from '../../models';
import MapLayersControl from './mapControls/MapLayersControl';
import Toolbar from './toolbar/Toolbar';
import PopupLayer from './layers/PopupLayer';
import { NodeStore } from '../../stores/nodeStore';
import NodeLayer from './layers/NodeLayer';
import MeasurementControl from './mapControls/MeasurementControl';
import * as s from './map.scss';
import NetworkLayers from './layers/NetworkLayers';

interface IMapState {
    zoomLevel: number;
}

interface IMapProps {
    mapStore?: MapStore;
    routeStore?: RouteStore;
    nodeStore?: NodeStore;
}

interface IMapPropReference {
    children: JSX.Element[];
    ref: any;
    center: L.LatLng;
    zoom: number;
    zoomControl: false;
    id: string;
}

export type LeafletContext = {
    map?: L.Map,
    pane?: string,
    layerContainer?: LayerContainer,
    popupContainer?: L.Layer,
};

@inject('mapStore', 'routeStore', 'nodeStore')
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
    }

    private getMap() {
        return this.mapReference.current!.leafletElement;
    }

    public componentDidMount() {
        const map = this.getMap();
        // TODO: Convert these as react-components
        map.addControl(new CoordinateControl({ position: 'topright' }));
        // map.addControl(new MeasurementControl({ position: 'topright' }));
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

    private bringRouteLayerToFront = (internalId: string) => {
        this.getMap().eachLayer((layer: any) => {
            if (layer.options.routePathInternalId === internalId) {
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

    private startCoordinates(visibleRoutePaths: IRoutePath[]) {
        return visibleRoutePaths.map((routePath: IRoutePath) => routePath.geoJson.coordinates[0]);
    }

    /* Leaflet methods */
    private setView(latLng: L.LatLng) {
        this.getMap().setView(latLng, 17);
    }

    public render() {
        // TODO Changing the class is no longer needed but the component needs to be
        // rendered after changes to mapStore!.isMapFullscreen so there won't be any
        // grey tiles.
        const fullScreenMapViewClass = (this.props.mapStore!.isMapFullscreen) ? '' : '';

        const visibleRoutePaths = this.getVisibleRoutePaths(this.props.routeStore!.routes);
        const visibleNodes = this.props.nodeStore!.getNodesUsedInRoutePaths(visibleRoutePaths);
        const colors = ColorScale.getColors(visibleRoutePaths.length);
        return (
            <div
                className={classnames(
                    s.mapView,
                    fullScreenMapViewClass,
                )}
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
                        maxZoom={19}
                        minZoom={8}
                        detectRetina={true}
                        tileSize={512}
                        zoomOffset={-1}
                        // tslint:enable:max-line-length
                    />
                    <NetworkLayers />
                    <RouteLayer
                        colors={colors}
                        routePaths={visibleRoutePaths}
                        fitBounds={this.fitBounds}
                        bringRouteLayerToFront={this.bringRouteLayerToFront}
                    />
                    <MarkerLayer
                        coordinates={this.startCoordinates(visibleRoutePaths)}
                    />
                    <NodeLayer
                        nodes={visibleNodes}
                    />
                    <PopupLayer
                        setView={this.setView}
                    />
                    <Control position='topleft'>
                        <Toolbar />
                    </Control>

                    <Control position='topright'>
                        <MeasurementControl />
                    </Control>

                    <Control position='bottomleft'>
                        <MapLayersControl />
                    </Control>

                    <Control position='bottomright'>
                        <FullscreenControl />
                    </Control>
                    <ZoomControl position='bottomright' />
                </Map>
            </div>
        );
    }
}

export default LeafletMap;
