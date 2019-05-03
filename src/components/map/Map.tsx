import { LayerContainer, Map, TileLayer, ZoomControl } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet-editable';
import { inject, observer } from 'mobx-react';
import { IReactionDisposer, reaction, toJS } from 'mobx';
import React from 'react';
import classnames from 'classnames';
import 'leaflet/dist/leaflet.css';
import { MapStore } from '~/stores/mapStore';
import { RouteListStore } from '~/stores/routeListStore';
import { NodeStore } from '~/stores/nodeStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import EventManager from '~/util/EventManager';
import Control from './mapControls/CustomControl';
import CoordinateControl from './mapControls/CoordinateControl';
import FullscreenControl from './mapControls/FullscreenControl';
import RouteLayer from './layers/RouteLayer';
import UpsertRoutePathLayer from './layers/edit/UpsertRoutePathLayer';
import EditLinkLayer from './layers/edit/EditLinkLayer';
import EditNodeLayer from './layers/edit/EditNodeLayer';
import MapLayersControl from './mapControls/MapLayersControl';
import MapLayersZoomHint from './mapControls/MapLayersZoomHint';
import Toolbar from './toolbar/Toolbar';
import AddressSearch from './AddressSearch';
import PopupLayer from './layers/PopupLayer';
import MeasurementControl from './mapControls/MeasurementControl';
import NetworkLayers from './layers/NetworkLayers';
import * as s from './map.scss';
import './map.css';

interface IMapProps {
    mapStore?: MapStore;
    routeListStore?: RouteListStore;
    nodeStore?: NodeStore;
    toolbarStore?: ToolbarStore;
}

interface IMapPropReference {
    children: JSX.Element[];
    ref: any;
    center: L.LatLng;
    zoom: number;
    zoomControl: false;
    id: string;
    editable: boolean;
}

export type LeafletContext = {
    map?: L.Map;
    pane?: string;
    layerContainer?: LayerContainer;
    popupContainer?: L.Layer;
};

@inject('mapStore', 'routeListStore', 'nodeStore', 'toolbarStore')
@observer
class LeafletMap extends React.Component<IMapProps> {
    private mapReference: React.RefObject<Map<IMapPropReference, L.Map>>;
    private reactionDisposers: IReactionDisposer[];

    constructor(props: IMapProps) {
        super(props);
        this.mapReference = React.createRef();
        this.reactionDisposers = [];
    }

    private getMap() {
        return this.mapReference.current
            ? this.mapReference.current.leafletElement
            : null;
    }

    componentDidMount() {
        const map = this.getMap();
        if (!map) throw 'Map was not loaded.';

        // Ugly hack to force map to reload, necessary because map stays gray when app is in docker
        // TODO: Should be fixed: https://github.com/HSLdevcom/jore-map-ui/issues/284
        setTimeout(() => {
            const map = this.getMap();
            map && map.invalidateSize();
        }, 1000);

        map.addControl(L.control.scale({ imperial: false }));

        // TODO: Convert these as react-components
        map.addControl(new CoordinateControl({ position: 'topright' }));
        // map.addControl(new MeasurementControl({ position: 'topright' }));
        map.on('moveend', () => {
            this.props.mapStore!.setCoordinates(map.getCenter());
        });

        map.on('zoomend', () => {
            this.props.mapStore!.setZoom(map.getZoom());
        });

        this.reactionDisposers.push(
            reaction(() => this.props.mapStore!.coordinates, this.centerMap)
        );

        this.reactionDisposers.push(
            reaction(() => this.props.mapStore!.mapBounds, this.fitBounds)
        );

        this.reactionDisposers.push(
            reaction(() => this.props.mapStore!.mapCursor, this.setMapCursor)
        );

        map.setView(
            this.props.mapStore!.coordinates,
            this.props.mapStore!.zoom
        );
        map.on('click', (e: L.LeafletEvent) =>
            EventManager.trigger('mapClick', e)
        );
    }

    private centerMap = () => {
        const map = this.getMap();
        if (map) {
            const storeCoordinates = this.props.mapStore!.coordinates;
            const mapCoordinates = map.getCenter();
            if (!L.latLng(storeCoordinates).equals(L.latLng(mapCoordinates))) {
                map.setView(storeCoordinates, map.getZoom());
            }
        }
    };

    private fitBounds = () => {
        const map = this.getMap();
        map &&
            map.fitBounds(this.props.mapStore!.mapBounds, {
                maxZoom: 20,
                animate: true,
                padding: [100, 100]
            });
    };

    private setMapCursor = () => {
        const mapElement = document.getElementById(s.mapLeaflet);
        if (mapElement) {
            mapElement.style.cursor = this.props.mapStore!.mapCursor;
        }
    };

    componentDidUpdate() {
        const map = this.getMap();
        map && map.invalidateSize();
    }

    componentWillUnmount() {
        this.reactionDisposers.forEach(r => r());
    }

    render() {
        const node = this.props.nodeStore!.node;
        // TODO Changing the class is no longer needed but the component needs to be
        // rendered after changes to mapStore!.isMapFullscreen so there won't be any
        // grey tiles
        const fullScreenMapViewClass = this.props.mapStore!.isMapFullscreen
            ? ''
            : '';
        const routes = toJS(this.props.routeListStore!.routes);
        return (
            <div className={classnames(s.mapView, fullScreenMapViewClass)}>
                {this.props.children}
                <Map
                    ref={this.mapReference}
                    zoomControl={false}
                    id={s.mapLeaflet}
                    editable={true}
                >
                    <TileLayer
                        // tslint:disable:max-line-length
                        url='https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}.png'
                        attribution={`
                                Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,
                                <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>
                                Imagery © <a href="http://mapbox.com">Mapbox</a>
                                />
                            `}
                        baseLayer={true}
                        maxZoom={21}
                        minZoom={8}
                        detectRetina={true}
                        tileSize={512}
                        zoomOffset={-1}
                        // tslint:enable:max-line-length
                    />
                    <NetworkLayers />
                    {node && <EditNodeLayer />}
                    <EditLinkLayer />
                    <RouteLayer routes={routes} />
                    <UpsertRoutePathLayer />
                    <PopupLayer />
                    <Control position='topleft'>
                        <div className={s.mapLayersContainer}>
                            <Toolbar />
                            <AddressSearch map={this.mapReference} />
                        </div>
                    </Control>
                    <Control position='topright'>
                        <MeasurementControl />
                    </Control>
                    <Control position='bottomleft'>
                        <div className={s.mapLayersContainer}>
                            <MapLayersControl />
                            <MapLayersZoomHint />
                        </div>
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
