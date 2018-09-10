import React, { Component } from 'react';
import L from 'leaflet';
import { Polyline } from 'react-leaflet';
import { IRoutePath } from '../../models';
import { toJS } from 'mobx';

interface RouteLayerProps {
    routePaths: IRoutePath[];
    fitBounds: (bounds: L.LatLngBoundsExpression) => void;
    colors: string[];
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

    private selectPolyLine(routePath: IRoutePath) {
        const selectedPolylines = this.state.selectedPolylines;

        const indexInArray: number = selectedPolylines.indexOf(routePath.internalId);

        if (indexInArray > -1) {
            selectedPolylines.splice(indexInArray, 1);
        } else {
            selectedPolylines.push(routePath.internalId);
        }

        this.setState({
            selectedPolylines,
        });
    }

    private isSelected(internalId: string) {
        if (this.state.selectedPolylines.includes(internalId) ||
            this.state.hoveredPolylines.includes(internalId)) {
            return true;
        }
        return false;
    }

    private mouseHoverIn(internalId: string) {
        const hoveredPolylines = this.state.hoveredPolylines;
        hoveredPolylines.push(internalId);
        this.setState({
            hoveredPolylines,
        });
    }

    private mouseHoverOut = () => {
        this.setState({
            hoveredPolylines: [],
        });
    }

    render() {
        return this.props.routePaths
            .map((routePath, index) => {
                return (
                    <Polyline
                        key={index}
                        positions={routePath.positions}
                        color={this.props.colors[index]}
                        weight={this.isSelected(routePath.internalId) ? 5 : 4}
                        opacity={this.isSelected(routePath.internalId) ? 1 : 0.5}
                        onClick={this.selectPolyLine.bind(this, routePath)}
                        onMouseOver={this.mouseHoverIn.bind(this, routePath.internalId)}
                        onMouseOut={this.mouseHoverOut}
                    />
                );
            });
    }
}
