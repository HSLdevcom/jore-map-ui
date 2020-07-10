import classnames from 'classnames';
import * as L from 'leaflet';
import 'leaflet-editable';
import 'leaflet/dist/leaflet.css';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { LayerContainer, Map, Pane, TileLayer, ZoomControl } from 'react-leaflet';
import EventHelper from '~/helpers/EventHelper';
import { MapBaseLayer, MapStore } from '~/stores/mapStore';
import { NodeStore } from '~/stores/nodeStore';
import { RouteListStore } from '~/stores/routeListStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import AddressSearch from './AddressSearch';
import HighlightEntityLayer from './layers/HighlightEntityLayer';
import NetworkLayers from './layers/NetworkLayers';
import PopupLayer from './layers/PopupLayer';
import RoutePathListLayer from './layers/RoutePathListLayer';
import StopAreaLayer from './layers/StopAreaLayer';
import EditLinkLayer from './layers/edit/EditLinkLayer';
import EditNodeLayer from './layers/edit/EditNodeLayer';
import EditRoutePathLayer from './layers/edit/EditRoutePathLayer';
import './map.css';
import * as s from './map.scss';
import CoordinateControl from './mapControls/CoordinateControl';
import Control from './mapControls/CustomControl';
import FullscreenControl from './mapControls/FullscreenControl';
import MapLayersControl from './mapControls/MapLayersControl';
import MapLayersZoomHint from './mapControls/MapLayersZoomHint';
import MeasurementControl from './mapControls/MeasurementControl';
import Toolbar from './toolbar/Toolbar';

interface IMapProps {
    mapStore?: MapStore;
    routeListStore?: RouteListStore;
    nodeStore?: NodeStore;
    toolbarStore?: ToolbarStore;
}

interface IMapPropReference {
    children: JSX.Element[];
    ref: any;
    center?: L.LatLng;
    zoom?: number;
    zoomControl: false;
    id: string;
    editable: boolean;
    className: string;
}

type LeafletContext = {
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

    componentDidMount() {
        const mapStore = this.props.mapStore;
        const map = this.getMap();
        if (!map) throw 'Map was not loaded.';

        map.addControl(L.control.scale({ imperial: false }));
        map.on('moveend', () => {
            mapStore!.setCoordinates(map.getCenter());
        });
        map.on('zoomend', () => {
            mapStore!.setZoom(map.getZoom());
        });

        this.reactionDisposers.push(reaction(() => mapStore!.coordinates, this.centerMap));
        this.reactionDisposers.push(reaction(() => mapStore!.mapBounds, this.fitBounds));
        this.reactionDisposers.push(reaction(() => mapStore!.mapCursor, this.setMapCursor));

        const coordinates = mapStore!.coordinates;
        if (coordinates) {
            map.setView(coordinates, mapStore!.zoom);
        }
        this.enableMapClickListener();
    }

    private enableMapClickListener = () => {
        const map = this.getMap();
        map!.on('click', (e: L.LeafletEvent) => {
            EventHelper.trigger('mapClick', e);
        });
    };

    private disableMapClickListener = () => {
        const map = this.getMap();
        map!.off('click');
    };

    private getMap() {
        return this.mapReference.current ? this.mapReference.current.leafletElement : null;
    }

    private centerMap = () => {
        const mapStore = this.props.mapStore;
        const map = this.getMap();
        if (map) {
            try {
                const mapCoordinates = map.getCenter();
                if (!L.latLng(mapStore!.coordinates!).equals(L.latLng(mapCoordinates))) {
                    map.setView(mapStore!.coordinates!, map.getZoom());
                }
            } catch {
                map.setView(mapStore!.coordinates!, mapStore!.zoom);
            }
        }
    };

    private fitBounds = () => {
        const map = this.getMap();
        map &&
            map.fitBounds(this.props.mapStore!.mapBounds, {
                maxZoom: 20,
                animate: true,
                padding: [100, 100],
                duration: 0.5,
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
        this.reactionDisposers.forEach((r) => r());
    }

    render() {
        const isMapInteractionRestricted = this.props.mapStore!.isMapInteractionRestricted;
        return (
            <div className={s.mapView} data-cy='mapView'>
                {this.props.children}
                <Map
                    ref={this.mapReference}
                    zoomControl={false}
                    id={s.mapLeaflet}
                    editable={true}
                    className={isMapInteractionRestricted ? s.disableInteraction : ''}
                >
                    <TileLayer
                        url={
                            this.props.mapStore?.visibleMapBaseLayer === MapBaseLayer.DIGITRANSIT
                                ? 'https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}.png'
                                : 'https://ortophotos.blob.core.windows.net/hsy-map/hsy_tiles2/{z}/{x}/{y}.jpg'
                        }
                        attribution={
                            this.props.mapStore?.visibleMapBaseLayer === MapBaseLayer.DIGITRANSIT
                                ? `Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,
                                <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>
                                Imagery © <a href="http://mapbox.com">Mapbox</a>
                                />`
                                : `© Espoon, Helsingin ja Vantaan kauupungit, Kirkkonummen ja Nurmijärven kunnat sekä HSL ja HSY`
                        }
                        baseLayer={true}
                        maxZoom={19}
                        minZoom={9}
                        detectRetina={true}
                        tileSize={512}
                        zoomOffset={-1}
                    />
                    <NetworkLayers />
                    <EditNodeLayer />
                    <EditLinkLayer />
                    <RoutePathListLayer />
                    <EditRoutePathLayer
                        enableMapClickListener={this.enableMapClickListener}
                        disableMapClickListener={this.disableMapClickListener}
                    />
                    <PopupLayer />
                    <StopAreaLayer />
                    <HighlightEntityLayer />
                    <Pane name='highlightEntityLayer' style={{ zIndex: 999 }} />
                    <Control position='topleft'>
                        <div className={s.mapLayersContainer}>
                            <Toolbar />
                            <AddressSearch map={this.mapReference} />
                        </div>
                    </Control>
                    <Control position='topright'>
                        <div
                            className={classnames(s.mapLayersContainer, s.topRightControlContainer)}
                        >
                            <CoordinateControl />
                            <MeasurementControl map={this.mapReference} />
                        </div>
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

export { LeafletContext };
