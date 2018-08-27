import { Map, TileLayer, ZoomControl, FeatureGroup } from 'react-leaflet';
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
import * as s from './map.scss';

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

    constructor(props: IMapProps) {
        super(props);
        this.state = {
            map: undefined,
            zoomLevel: 15,
        };
    }

    public componentDidMount() {
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
                    <FeatureGroup>
                        <RouteLayer
                            routes={this.props.routeStore!.routes}
                        />
                    </FeatureGroup>
                    <Control position='topleft' />
                    <Control position='topright'>
                        <FullscreenControl map={this.state.map} />
                    </Control>
                    <ZoomControl position='bottomright' />
                    <Control position='bottomright' />
                    <Control position='bottomleft' />
                </Map>
            </div>
        );
    }
}

export default LeafletMap;
