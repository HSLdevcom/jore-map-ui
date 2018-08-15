import * as L from 'leaflet';
import { IRoutePath, IRoute, INode } from '../models';
import * as s from './routeLayer.scss';
import { SidebarStore } from '../stores/sidebarStore';
import NodeType from '../enums/nodeType';
import colorScale from '../util/colorScale';

export default class RouteLayerView {
    private map: L.Map;
    private sidebarStore?: SidebarStore;
    private routeLines: L.GeoJSON<any>[];
    private routeNodes: L.CircleMarker<any>[];

    constructor(map: L.Map, sidebarStore?: SidebarStore) {
        this.map = map;
        this.sidebarStore = sidebarStore;
        this.routeLines = [];
        this.routeNodes = [];
    }

    public drawRouteLines(routes: IRoute[]) {
        this.clearRoute();

        let visibleRoutePathIndex = 0;
        if (routes && routes[0]) {
            if (routes[0].routePaths[0]) {
                routes[0].routePaths.map((routePath) => {
                    if (routePath.visible) {
                        const visibleRoutePaths = routes[0].routePaths.filter(
                            x => x.visible).length;
                        const routeColor = colorScale.getColors(
                            visibleRoutePaths)[visibleRoutePathIndex];
                        this.drawRouteLine(routePath, routeColor);
                        this.drawNodes(routePath, routeColor);
                        visibleRoutePathIndex += 1;
                    }
                });
            } else {
                // TODO: throw error / show error on UI if routePath is empty?
            }
        } else {
            this.clearRoute();
        }
    }

    private drawRouteLine(routePath: IRoutePath, color: string) {
        const geoJSON = new L.GeoJSON(routePath.geoJson)
        .setStyle({
            color,
            className: s.route,
        })
        .addTo(this.map);
        this.routeLines.push(geoJSON);
    }

    private drawNodes(routePath: IRoutePath, color: string) {
        routePath.nodes.map((node) => {
            this.drawNode(node, routePath.direction, color);
        });
    }

    private drawNode(node: INode, direction: string, color: string) {
        const getColor = (type: NodeType, defaultColor: string) => {
            if (node.type === NodeType.CROSSROAD) {
                return '#666666'; // grey
            }
            return defaultColor;
        };

        const coordinates = node.geoJson.coordinates;
        const circle = new L.CircleMarker([coordinates[1], coordinates[0]])
        .setStyle({
            color: getColor(node.type, color),
            className: s.node,
        })
        .on('click', () => {
            this.sidebarStore!.setOpenedNodeId(node.id);
        })
        .addTo(this.map);
        this.routeNodes.push(circle);
    }

    private clearRoute() {
        this.routeLines.map((layer: L.GeoJSON) => {
            this.map.removeLayer(layer);
        });
        this.routeNodes.map((circleMarker: L.CircleMarker) => {
            this.map.removeLayer(circleMarker);
        });
        this.routeLines = [];
        this.routeNodes = [];
    }

}
