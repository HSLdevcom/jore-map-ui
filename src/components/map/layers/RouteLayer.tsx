import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { withLeaflet } from 'react-leaflet';
import { IRoute } from '~/models';
import { MapStore } from '~/stores/mapStore';
import { LeafletContext } from '../Map';
import RoutePathLayer from './RoutePathLayer';

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

    private toggleHighlight = (internalId: string) => (target: any) => () => {
        let selectedPolylines = this.state.selectedPolylines;

        if (selectedPolylines.includes(internalId)) {
            selectedPolylines = selectedPolylines.filter(id => id !== internalId);
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
