import { Map, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { MapStore } from '../../stores/mapStore';
import { SidebarStore } from '../../stores/sidebarStore';
import classnames from 'classnames';
import { RouteStore } from '../../stores/routeStore';
import * as s from './map.scss';

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
    constructor(props: IMapProps) {
        super(props);
    }

    public render() {
        return (
            <Map
                center={this.props.mapStore!.coordinates}
                zoom={15}
                zoomControl={false}
                className={classnames('root', s.mapLeaflet)}
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
                <ZoomControl
                    position='bottomright'
                />
            </Map>
        );
    }
}

export default LeafletMap;
