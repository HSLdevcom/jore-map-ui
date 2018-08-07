import * as L from 'leaflet';
import { IRoutePath, IRoute } from '../models';
import { routeLayerBlue, routeLayerRed } from './routeLayer.scss';

export default class RouteLayerView {
    private map: L.Map;
    private routeLayers: L.GeoJSON<any>[];

    constructor(map: L.Map) {
        this.map = map;
        this.routeLayers = [];
    }

    public drawRouteLines(routes: IRoute[]) {
        this.clearRoute();

        if (routes && routes[0]) {
            if (routes[0].routePaths[0]) {
                routes[0].routePaths.map((routePath) => {
                    if (routePath.visible) {
                        this.drawRouteLine(routePath);
                    }
                });
            } else {
                // TODO: throw error / show error on UI if routePath is empty?
            }
        } else {
            this.clearRoute();
        }
    }

    private drawRouteLine(routePath: IRoutePath) {
        const getClassName = (type: string) => {
            switch (routePath.direction) {
            case '1': return routeLayerBlue;
            case '2': return routeLayerRed;
            default: return routeLayerBlue;
            }
        };

        const geoJSON = new L.GeoJSON(routePath.geoJson)
        .setStyle({
            className: getClassName(routePath.direction),
        })
        .addTo(this.map);
        this.routeLayers.push(geoJSON);
    }

    private clearRoute() {
        this.routeLayers.map((layer: L.GeoJSON) => {
            this.map.removeLayer(layer);
        });
        this.routeLayers = [];
    }

}
