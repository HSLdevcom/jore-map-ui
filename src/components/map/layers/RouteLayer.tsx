import React, { Component } from 'react';
import L from 'leaflet';
import { observer, inject } from 'mobx-react';
import { MapStore } from '~/stores/mapStore';
import { IRoute, IRoutePathLink } from '~/models';
import RoutePathLayer from './RoutePathLayer';

interface RouteLayerProps {
    mapStore?: MapStore;
    routes: IRoute[];
}

interface IRouteLayerState {
    selectedPolylines: string[];
    hoveredPolylines: string[];
}

@inject('mapStore')
@observer
class RouteLayer extends Component<RouteLayerProps, IRouteLayerState> {
    constructor(props: RouteLayerProps) {
        super(props);
        this.state = {
            selectedPolylines: [],
            hoveredPolylines: [],
        };
    }

    calculateBounds() {
        const bounds:L.LatLngBounds = new L.LatLngBounds([]);

        this.props.routes.forEach((route) => {
            route.routePaths.forEach((routePath) => {
                routePath.routePathLinks!.forEach((routePathLink) => {
                    routePathLink.geometry
                        .forEach(pos => bounds.extend(pos));
                });
            });
        });

        if (bounds.isValid()) {
            this.props.mapStore!.setMapBounds(bounds);
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
        }
    }

    render() {
        return this.props.routes
            .map((route) => {
                return (
                    <RoutePathLayer
                        key={route.id}
                        toggleHighlight={this.toggleHighlight}
                        hoverHighlight={this.hoverHighlight}
                        hoverHighlightOff={this.hoverHighlightOff}
                        hasHighlight={this.hasHighlight}
                        routePaths={route.routePaths}
                    />
                );
            });
    }
}

export default RouteLayer;
