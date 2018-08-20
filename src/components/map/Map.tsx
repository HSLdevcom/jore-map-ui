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
import FullscreenControl from './FullscreenControl';
import RouteLayerView from '../../layers/routeLayerView';
import { IRoute } from '../../models';
import * as s from './map.scss';

interface IMapState {
    refreshMapKey: number;
    isMapFullscreen: boolean;
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
    private map: Map | null;
    private routeLayerView: RouteLayerView;

    constructor(props: IMapProps) {
        super(props);
        this.state = {
            refreshMapKey: 1,
            isMapFullscreen: false,
        };
    }

    public componentDidMount() {
        autorun(() => this.updateRouteLines());
    }

    private updateRouteLines() {
        if (this.map) {
            if (!this.routeLayerView) {
                this.routeLayerView = new RouteLayerView(
                    this.map.leafletElement, this.props.sidebarStore);
            }
            this.routeLayerView.drawRouteLines(this.props.routeStore!.routes);
            this.centerMapToRoutes(this.props.routeStore!.routes);
        }
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
                this.map!.leafletElement.fitBounds(bounds);
            }
        }
    }

    public componentDidUpdate() {
        if (this.state.isMapFullscreen !== this.props.mapStore!.isMapFullscreen) {
            const newRefreshMapKey = this.state.refreshMapKey + 1;
            // Change refreshMapKey if isMapFullscreen is changed to refresh map
            this.setState({
                refreshMapKey: newRefreshMapKey,
                isMapFullscreen: this.props.mapStore!.isMapFullscreen,
            });
        }
    }

    public render() {
        let mapClass = '';
        if (this.props.mapStore!.isMapFullscreen) {
            mapClass = classnames('root', s.fullscreen);
        } else {
            mapClass = classnames('root');
        }

        return (
            <Map
                ref={(ref) => { this.map = ref; }}
                center={this.props.mapStore!.coordinates}
                zoom={15}
                key={this.state.refreshMapKey}
                zoomControl={false}
                id={s.mapLeaflet}
                className={mapClass}

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
                    <div>Test Top-Left</div>
                </Control>
                <Control position='topright'>
                    <FullscreenControl />
                </Control>
                <ZoomControl position='bottomright' />
                <Control position='bottomright'>
                    <div>Test Bottom-Right</div>
                </Control>
                <Control position='bottomleft'>
                    <div>Test Bottom-Left</div>
                </Control>
            </Map>
        );
    }
}

export default LeafletMap;
