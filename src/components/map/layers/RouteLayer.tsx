import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { withLeaflet } from 'react-leaflet';
import { MapStore } from '~/stores/mapStore';
import { RouteListStore } from '~/stores/routeListStore';
import { LeafletContext } from '../Map';
import RoutePathLayer from './RoutePathLayer';

interface RouteLayerProps {
    leaflet: LeafletContext;
    mapStore?: MapStore;
    routeListStore?: RouteListStore;
}

interface IRouteLayerState {
    selectedPolylines: string[];
    hoveredPolylines: string[];
}

@inject('mapStore', 'routeListStore')
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
        const routes = toJS(this.props.routeListStore!.routes);
        return routes.map(route => {
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
