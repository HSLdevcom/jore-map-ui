import React, { Component } from 'react';
import L from 'leaflet';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import { SidebarStore } from '~/stores/sidebarStore';
import { NodeStore } from '~/stores/nodeStore';
import { IRoutePath, IRoutePathLink } from '~/models';
import routeBuilder  from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import RoutePathLayer from './RoutePathLayer';

interface RouteLayerProps {
    sidebarStore?: SidebarStore;
    nodeStore?: NodeStore;
    routePaths: IRoutePath[];
    fitBounds: (bounds: L.LatLngBoundsExpression) => void;
    colors: string[];
}

interface IRouteLayerState {
    selectedPolylines: string[];
    hoveredPolylines: string[];
}

@inject('sidebarStore', 'nodeStore')
@observer
export default class RouteLayer extends Component<RouteLayerProps, IRouteLayerState> {
    constructor(props: RouteLayerProps) {
        super(props);
        this.state = {
            selectedPolylines: [],
            hoveredPolylines: [],
        };
    }

    calculateBounds() {
        let bounds:L.LatLngBounds = new L.LatLngBounds([]);

        this.props.routePaths.forEach((routePath) => {
            const geoJSON = L.geoJSON(toJS(routePath.geoJson));
            if (!bounds) {
                bounds = geoJSON.getBounds();
            } else {
                bounds.extend(geoJSON.getBounds());
            }
        });

        if (bounds.isValid()) {
            this.props.fitBounds(bounds);
        }
    }

    componentDidUpdate(prevProps: RouteLayerProps) {
        const routePathsChanged =
            prevProps.routePaths.map(rPath => rPath.internalId).join(':')
            !== this.props.routePaths.map(rPath => rPath.internalId).join(':');
        if (routePathsChanged) {
            this.calculateBounds();
            this.setState({
                selectedPolylines: [],
            });
        }
    }

    private toggleHighlight = (internalId: string) => (e: L.LeafletMouseEvent) => {
        let selectedPolylines = this.state.selectedPolylines;

        if (selectedPolylines.includes(internalId)) {
            selectedPolylines =
                selectedPolylines.filter(id => id !== internalId);
        } else {
            selectedPolylines.push(internalId);
        }

        this.setState({
            selectedPolylines,
        });
        e.target.bringToFront();
    }

    private openLinkView = (routePathLinkId: number) => {
        // TODO deal with fetching linkID in the endpoint
        this.props.sidebarStore!.setOpenLinkId(routePathLinkId);
        const linkViewLink = routeBuilder.to(subSites.link).toLink();
        navigator.goTo(linkViewLink);
    }

    private hasHighlight(internalId: string) {
        return this.state.selectedPolylines.includes(internalId) ||
            this.state.hoveredPolylines.includes(internalId);
    }

    private bringRouteToFront = (internalId: string, links: IRoutePathLink[]) =>
    (e: L.LeafletMouseEvent) => {
        this.setDisabledNodeIds(links);
        this.setState({
            hoveredPolylines: this.state.hoveredPolylines.concat(internalId),
        });
        e.target.bringToFront();
    }

    private setDisabledNodeIds = (links: IRoutePathLink[]) => {
        const linksWithDisabledNodes = links.filter(link => (link.startNodeType === 'E'));
        const disabledNodeIds: string[] = linksWithDisabledNodes.map((link: IRoutePathLink) => {
            return link.startNodeId;
        });
        this.props.nodeStore!.setDisabledNodeIds(disabledNodeIds);
    }

    private bringRouteToBack = (e: L.LeafletMouseEvent) => {
        this.props.nodeStore!.setDisabledNodeIds([]);
        this.setState({
            hoveredPolylines: [],
        });
        if (!this.hasHighlight(e['sourceTarget'].options.routePathInternalId)) {
            e.target.bringToBack();
        }
    }

    render() {
        return this.props.routePaths
            .map((routePath, index) => {
                const color = this.props.colors[index];
                const internalId = routePath.internalId;
                return (
                    <RoutePathLayer
                        key={index}
                        internalId={internalId}
                        onClick={this.toggleHighlight(internalId)}
                        onContextMenu={this.openLinkView}
                        onMouseOver={this.bringRouteToFront(internalId, routePath.routePathLinks)}
                        onMouseOut={this.bringRouteToBack}
                        routePathLinks={routePath.routePathLinks}
                        color={color}
                        opacity={this.hasHighlight(internalId) ? 1 : 0.6}
                        weight={this.hasHighlight(internalId) ? 8 : 7}
                    />
                );
            });
    }
}
