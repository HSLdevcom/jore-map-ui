import { Map, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { MapStore } from '../../stores/mapStore';
import { SidebarStore } from '../../stores/sidebarStore';
import classnames from 'classnames';
import { RouteStore } from '../../stores/routeStore';
import * as s from './map.scss';
import Control from './CustomControl';
import FullscreenControl from './FullscreenControl';

interface IMapProps {
    mapStore?: MapStore;
    routeStore?: RouteStore;
    sidebarStore?: SidebarStore;
}

@inject('sidebarStore')
@inject('mapStore')
@inject('routeStore')
@observer
class LeafletMap extends React.Component<IMapProps> {
    public render() {
        let mapClass = '';
        if (this.props.mapStore!.isMapFullscreen) {
            mapClass = classnames('root', s.fullscreen);
        } else {
            mapClass = classnames('root');
        }

        return (
            <Map
                center={this.props.mapStore!.coordinates}
                zoom={15}
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
