import * as L from 'leaflet';
import { IRoutePath, IRoute, INode } from '../models';
import * as s from './routeLayer.scss';
import { SidebarStore } from '../stores/sidebarStore';
import NodeType from '../enums/nodeType';
import classnames from 'classnames';

enum PopupItemAction {
    TARGET = 'target',
    PRINT = 'print',
    REMOVE_LINK = 'removeLink',
    ADD_LINK = 'addLink',
    COPY_TO_ANOTHER_DIRECTION = 'copyToAnotherDirection',
}

export default class RouteLayerView {
    private map: L.Map;
    private sidebarStore?: SidebarStore;
    private routeLines: L.GeoJSON<any>[];
    private routeNodes: any[];
    private popup: L.Popup;
    private highlightedMarker?: L.CircleMarker<any>;
    private routeLayer: L.FeatureGroup;

    constructor(map: L.Map, sidebarStore?: SidebarStore) {
        this.map = map;
        this.sidebarStore = sidebarStore;
        this.routeLines = [];
        this.routeNodes = [];
        this.routeLayer = new L.FeatureGroup;
        this.map.addLayer(this.routeLayer);

        this.map.on('click', () => {
            this.deHighlightMarker();
        });
    }

    public drawRouteLines(routes: IRoute[]) {
        this.clearRoute();

        if (routes && routes[0]) {
            if (routes[0].routePaths[0]) {
                routes[0].routePaths.map((routePath) => {
                    if (routePath.visible) {
                        this.drawRouteLine(routePath);
                        this.drawNodes(routePath);
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
        const getColorClassName = (type: string) => {
            switch (routePath.direction) {
            case '1': return s.blue;
            case '2': return s.red;
            default: return s.blue;
            }
        };

        const geoJSON = new L.GeoJSON(routePath.geoJson)
        .setStyle({
            className: classnames(s.route, getColorClassName(routePath.direction)),
        })
        .addTo(this.routeLayer);
        this.routeLines.push(geoJSON);
    }

    private drawNodes(routePath: IRoutePath) {
        routePath.nodes.map((node) => {
            this.drawNode(node, routePath.direction);
        });
    }

    private drawNode(node: INode, direction: string) {
        const getColorClassName = (type: NodeType, direction: string) => {
            if (type === NodeType.CROSSROAD) return s.grey;
            if (node.type === NodeType.START) return s.green;

            switch (direction) {
            case '1': return s.blue;
            case '2': return s.red;
            default: return s.blue;
            }
        };
        const coordinates = node.geoJson.coordinates;
        const circle = new L.CircleMarker([coordinates[1], coordinates[0]]);
        circle.setStyle({
            className: classnames(s.node, getColorClassName(node.type, direction)),
        })
        .on('click', () => {
            this.sidebarStore!.setOpenedNodeId(node.id);
        })
        .on('contextmenu', (e: L.LeafletMouseEvent) => {
            if (this.popup) {
                this.map.removeLayer(this.popup);
            }

            this.deHighlightMarker();

            L.DomUtil.addClass(circle.getElement() as HTMLElement, s.highlightedMarker);
            this.highlightedMarker = circle;

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

        this.routeNodes.push(circle);

    }

    private deHighlightMarker() {
        if (this.highlightedMarker) {
            L.DomUtil.removeClass(
                this.highlightedMarker.getElement() as HTMLElement, s.highlightedMarker);
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
        this.routeNodes.map((circleMarker: L.CircleMarker) => {
            this.routeLayer.removeLayer(circleMarker);
        });
        this.routeLines = [];
        this.routeNodes = [];
    }

}
