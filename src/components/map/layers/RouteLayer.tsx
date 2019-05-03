import React, { Component } from 'react';
import L from 'leaflet';
import { withLeaflet } from 'react-leaflet';
import { observer, inject } from 'mobx-react';
import { MapStore } from '~/stores/mapStore';
import { IRoute } from '~/models';
import RoutePathLayer from './RoutePathLayer';
import { LeafletContext } from '../Map';

interface RouteLayerProps {
    mapStore?: MapStore;
    routes: IRoute[];
    leaflet: LeafletContext;
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
            hoveredPolylines: []
        };
    }

    private calculateBounds() {
        const bounds: L.LatLngBounds = new L.LatLngBounds([]);

        this.props.routes.forEach(route => {
            route.routePaths.forEach(routePath => {
                routePath.routePathLinks!.forEach(routePathLink => {
                    routePathLink.geometry.forEach(pos => bounds.extend(pos));
                });
            });
        });

        if (bounds.isValid()) {
            this.props.mapStore!.setMapBounds(bounds);
        }
    }

    componentDidUpdate(prevProps: RouteLayerProps) {
        // TODO: Fix this check when calculateBounds() is called
        const prevRoutePathIds = prevProps.routes
            .map(route =>
                route.routePaths.map(rPath => rPath.internalId).join(':')
            )
            .join(':');
        const currentRoutePathIds = this.props.routes
            .map(route =>
                route.routePaths.map(rPath => rPath.internalId).join(':')
            )
            .join(':');
        const routePathsChanged = prevRoutePathIds !== currentRoutePathIds;
        if (routePathsChanged) {
            this.calculateBounds();
            this.setState({
                selectedPolylines: []
            });
        }
    }

    private toggleHighlight = (internalId: string) => (target: any) => () => {
        let selectedPolylines = this.state.selectedPolylines;

        if (selectedPolylines.includes(internalId)) {
            selectedPolylines = selectedPolylines.filter(
                id => id !== internalId
            );
        } else {
            selectedPolylines.push(internalId);
        }

        this.setState({
            selectedPolylines
        });
        target.current.leafletElement.bringToFront();

        // This moves (magically) ArrowDecorators on top of routePathLinks
        const map = this.props.leaflet.map;
        map!.setView(map!.getCenter(), map!.getZoom());
    };

    private hasHighlight = (internalId: string) => {
        return (
            this.state.selectedPolylines.includes(internalId) ||
            this.state.hoveredPolylines.includes(internalId)
        );
    };

    private hoverHighlight = (internalId: string) => (target: any) => () => {
        if (!this.state.hoveredPolylines.includes(internalId)) {
            this.setState({
                hoveredPolylines: this.state.hoveredPolylines.concat(internalId)
            });
            target.current.leafletElement.bringToFront();

            // This moves (magically) ArrowDecorators on top of routePathLinks
            const map = this.props.leaflet.map;
            map!.setView(map!.getCenter(), map!.getZoom());
        }
    };

    private hoverHighlightOff = (internalId: string) => (target: any) => () => {
        this.setState({
            hoveredPolylines: []
        });
        if (!this.state.selectedPolylines.includes(internalId)) {
            target.current.leafletElement.bringToBack();

            // This moves (magically) ArrowDecorators on top of routePathLinks
            const map = this.props.leaflet.map;
            map!.setView(map!.getCenter(), map!.getZoom());
        }
    };

    render() {
        return this.props.routes.map(route => {
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

export default withLeaflet(RouteLayer);
