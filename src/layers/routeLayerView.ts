import * as L from 'leaflet';
import { IRoutePath, IRoute, INode } from '../models';
import NodeType from '../enums/nodeType';
import colorScale from '../util/colorScale';
import observableSidebarStore, { SidebarStore } from '../stores/sidebarStore';
import NodeMarker, { NodeMarkerOptions } from './nodeMarker';
import * as s from './routeLayer.scss';

enum PopupItemAction {
    TARGET = 'target',
    PRINT = 'print',
    REMOVE_LINK = 'removeLink',
    ADD_LINK = 'addLink',
    COPY_TO_ANOTHER_DIRECTION = 'copyToAnotherDirection',
}

export default class RouteLayerView {
    private map: L.Map;
    private sidebarStore: SidebarStore;
    private routeLines: L.GeoJSON<any>[];
    private routeNodes: L.Marker<any>[];
    private popup: L.Popup;
    private highlightedMarker?: NodeMarker;
    private routeLayer: L.FeatureGroup;

    constructor(map: L.Map) {
        this.map = map;
        this.sidebarStore = observableSidebarStore;
        this.routeLines = [];
        this.routeNodes = [];
        this.routeLayer = L.featureGroup();
        this.map.addLayer(this.routeLayer);

        this.map.on('click', () => {
            this.deHighlightMarker();
        });
    }

    public drawRouteLines(routes: IRoute[]) {
        this.clearRoute();
        let visibleRoutePathIndex = 0;
        let visibleRoutePaths = 0;
        routes.forEach((route: IRoute) => {
            const routePathsAmount = route.routePaths.filter(
                x => x.visible).length;
            visibleRoutePaths += routePathsAmount;
        });
        if (routes && routes[0]) {
            routes.forEach((route: IRoute) => {
                if (route.routePaths[0]) {
                    route.routePaths.map((routePath) => {
                        if (routePath.visible) {
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
            });
        } else {
            this.clearRoute();
        }
    }

    private drawRouteLine(routePath: IRoutePath, color: string) {
        /*
        // TODO: fix this: mobX index out of bounds warning
        const geoJSON = L.geoJSON(routePath.geoJson)
        .setStyle({
            color,
            className: s.route,
        })
        .addTo(this.routeLayer);
        this.routeLines.push(geoJSON);
        */
    }

    private drawNodes(routePath: IRoutePath, color: string) {
        routePath.nodes.map((node) => {
            this.drawNode(node, routePath.direction, color);
        });
    }

    private drawNode(node: INode, direction: string, color: string) {
        const nodeOptions : NodeMarkerOptions = {
            color: node.type === NodeType.CROSSROAD ? '#666666' : color,
            coordinates: node.coordinates,
        };

        const marker = new NodeMarker(nodeOptions);
        const leafletMarker = marker.getNodeMarker();
        leafletMarker.on('click', () => {
            this.sidebarStore!.setOpenedNodeId(node.id);
        })
        .on('contextmenu', (e: L.LeafletMouseEvent) => {
            if (this.popup) {
                this.map.removeLayer(this.popup);
            }

            this.deHighlightMarker();
            marker.addHighlight();
            this.highlightedMarker = marker;

            this.popup = L.popup({
                className: s.leafletPopup,
                closeButton: false,
            })
            .setLatLng(e.latlng)
            .setContent(this.createRightClickPopup())
            .addTo(this.routeLayer)
            .openOn(this.map);
        })
        .addTo(this.routeLayer);
        this.routeNodes.push(leafletMarker);

    }

    private deHighlightMarker() {
        if (this.highlightedMarker) {
            this.highlightedMarker.removeHighlight();
        }
    }

    private createRightClickPopup() {
        const createItem = (text: string, action: PopupItemAction) => {
            const item = document.createElement('div');
            item.className = s.popupItem;
            item.innerHTML = text;
            item.onclick = () => {
                this.map.removeLayer(this.popup);
                this.popupMenuSelect(action)();
            };
            return item;
        };

        const popupContainer = document.createElement('div');
        popupContainer.className = s.popupContainer;
        popupContainer.appendChild(
            createItem('Avaa kohde', PopupItemAction.TARGET),
        );
        popupContainer.appendChild(
            createItem('Tulosta', PopupItemAction.PRINT),
        );
        popupContainer.appendChild(
            createItem('Poista linkki', PopupItemAction.REMOVE_LINK),
        );
        popupContainer.appendChild(
            createItem('Lisää linkki', PopupItemAction.ADD_LINK),
        );
        popupContainer.appendChild(
            createItem('Kopioi toiseen suuntaan', PopupItemAction.COPY_TO_ANOTHER_DIRECTION),
        );

        return popupContainer;
    }

    private popupMenuSelect(action: string) {
        switch (action) {
        case PopupItemAction.TARGET:
            return () => {
                // TODO: Target
            };
        case PopupItemAction.PRINT:
            return () => {
                // TODO: Print
            };
        case PopupItemAction.REMOVE_LINK:
            return () => {
                // TODO: Remove link
            };
        case PopupItemAction.ADD_LINK:
            return () => {
                // TODO: Add link
            };
        case PopupItemAction.COPY_TO_ANOTHER_DIRECTION:
            return () => {
                // TODO: Copy to another direction
            };
        default:
            console.log('Action not supported ', action); // tslint:disable-line
            return () => {
                // Do nothing
            };
        }
    }

    private clearRoute() {
        this.routeLines.map((layer: L.GeoJSON) => {
            this.routeLayer.removeLayer(layer);
        });
        this.routeNodes.map((marker: L.Marker) => {
            this.routeLayer.removeLayer(marker);
        });
        this.routeLines = [];
        this.routeNodes = [];
    }

}
