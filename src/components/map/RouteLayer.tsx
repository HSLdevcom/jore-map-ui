import React, { Component } from 'react';
import L from 'leaflet';
import { Polyline } from 'react-leaflet';
import { toJS } from 'mobx';
import { IRoutePath } from '../../models';

interface RouteLayerProps {
    routePaths: IRoutePath[];
    fitBounds: (bounds: L.LatLngBoundsExpression) => void;
    colors: string[];
    bringRouteLayerToFront: Function;
}

interface IRouteLayerState {
    selectedPolylines: string[];
    hoveredPolylines: string[];
}

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

    private selectPolyLine(internalId: string) {
        const selectedPolylines = this.state.selectedPolylines;
        const isSelected = selectedPolylines.indexOf(internalId) > -1;

        (isSelected) ?
            selectedPolylines.splice(selectedPolylines.indexOf(internalId), 1) :
            selectedPolylines.push(internalId);

        this.setState({
            selectedPolylines,
        });
        this.props.bringRouteLayerToFront(internalId);
    }

    private hasHighlight(internalId: string) {
        if (this.state.selectedPolylines.includes(internalId) ||
            this.state.hoveredPolylines.includes(internalId)) {
            return true;
        }
        return false;
    }

    private setHoverHighlights(internalId: string) {
        this.setState({
            hoveredPolylines: this.state.hoveredPolylines.concat(internalId),
        });
        this.props.bringRouteLayerToFront(internalId);
    }

    private clearHoverHightlights = () => {
        this.setState({
            hoveredPolylines: [],
        });
    }

    render() {
        return this.props.routePaths
            .map((routePath, index) => {
                const color = this.props.colors[index];
                const internalId = routePath.internalId;
                return (
                    <Polyline
                        key={index}
                        positions={routePath.positions}
                        color={color}
                        weight={this.hasHighlight(internalId) ? 5 : 4}
                        opacity={this.hasHighlight(internalId) ? 1 : 0.6}
                        onClick={this.selectPolyLine.bind(this, internalId)}
                        onMouseOver={this.setHoverHighlights.bind(this, internalId)}
                        onMouseOut={this.clearHoverHightlights}
                        internalId={internalId}
                    />
                );
            });
    }
}
