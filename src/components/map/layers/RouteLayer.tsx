import React, { Component } from 'react';
import L from 'leaflet';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import { SidebarStore } from '~/stores/sidebarStore';
import { NodeStore } from '~/stores/nodeStore';
import { IRoute, IRoutePathLink } from '~/models';
// import NodeType from '~/enums/nodeType';
import RoutePathLayer from './RoutePathLayer';

interface RouteLayerProps {
    sidebarStore?: SidebarStore;
    nodeStore?: NodeStore;
    routes: IRoute[];
    fitBounds: (bounds: L.LatLngBoundsExpression) => void;
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

        this.props.routes.forEach((route) => {
            route.routePaths.forEach((routePath) => {
                const geoJSON = L.geoJSON(toJS(routePath.geoJson));
                if (!bounds) {
                    bounds = geoJSON.getBounds();
                } else {
                    bounds.extend(geoJSON.getBounds());
                }
            });
        });

        if (bounds.isValid()) {
            this.props.fitBounds(bounds);
        }
    }

    componentDidUpdate(prevProps: RouteLayerProps) {
        // TODO: Fix this check when calculateBounds() is called
        const prevRoutePathIds = prevProps.routes.map(route =>
            route.routePaths.map(rPath => rPath.internalId).join(':')).join(':');
        const currentRoutePathIds = this.props.routes.map(route =>
            route.routePaths.map(rPath => rPath.internalId).join(':')).join(':');
        const routePathsChanged = prevRoutePathIds !== currentRoutePathIds;

        if (routePathsChanged) {
            this.calculateBounds();
            this.setState({
                selectedPolylines: [],
            });
        }
    }

    private toggleHighlight = (internalId: string, links: IRoutePathLink[]) =>
    (e: L.LeafletMouseEvent) => {
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

    private hasHighlight = (internalId: string) => {
        return this.state.selectedPolylines.includes(internalId) ||
            this.state.hoveredPolylines.includes(internalId);
    }

    private hoverHighlight = (internalId: string, links: IRoutePathLink[]) =>
    (e: L.LeafletMouseEvent) => {
        this.setState({
            hoveredPolylines: this.state.hoveredPolylines.concat(internalId),
        });
        e.target.bringToFront();
    }

    private hoverHighlightOff = (e: L.LeafletMouseEvent) => {
        this.setState({
            hoveredPolylines: [],
        });
        if (!this.hasHighlight(e['sourceTarget'].options.routePathInternalId)) {
            e.target.bringToBack();
            this.props.nodeStore!.setDisabledNodeIds([]);
            this.props.nodeStore!.setTimeAlignmentNodeIds([]);
        }
    }

    render() {
        return this.props.routes
            .map((route, index) => {
                return (
                    <RoutePathLayer
                        key={index}
                        toggleHighlight={this.toggleHighlight}
                        hoverHighlight={this.hoverHighlight}
                        hoverHighlightOff={this.hoverHighlightOff}
                        hasHighlight={this.hasHighlight}
                        routePaths={route.routePaths}
                        fitBounds={this.props.fitBounds}
                    />
                );
            });
    }
}
