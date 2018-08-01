import * as L from 'leaflet';
import { IDirection, IRoute } from '../models';

export default class RouteLayerView {

    private map: any;
    private routeLayers: any;

    constructor(map: any) {
        this.map = map;
        this.routeLayers = [];
    }

    public drawRouteLines(routes: IRoute[]) {
        if (routes && routes[0]) {
            if (routes[0].directions[0]) {
                routes[0].directions.map(direction => (
                    this.drawRouteLine(direction)
                ));
            } else {
                // TODO: throw error / show error on UI if direction is empty?
            }
        } else {
            this.clearRoute();
        }
    }

    private drawRouteLine(direction: IDirection) {
        const getClassName = (type: string) => {
            switch (direction.direction) {
            case '1': return 'blue';
            case '2': return 'red';
            default: return 'blue';
            }
        };

        const geoJSON = new L.GeoJSON(JSON.parse(direction.geoJson))
        .setStyle({
            className: 'routeLayer-' + getClassName(direction.direction),
        })
        .addTo(this.map);
        this.routeLayers.push(geoJSON);
    }

    private clearRoute() {
        this.routeLayers.map((layer: any) => {
            this.map.removeLayer(layer);
        });
        this.routeLayers = [];
    }

}
