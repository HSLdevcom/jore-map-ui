import React, { Component } from 'react';
import L from 'leaflet';
import { Polyline } from 'react-leaflet';
import { IRoutePath } from '../../models';

interface RouteLayerProps {
    routePaths: IRoutePath[];
    fitBounds: (bounds: L.LatLngBoundsExpression) => void;
    colors: string[];
}

export default class RouteLayer extends Component<RouteLayerProps> {
    calculateBounds() {
        let bounds:L.LatLngBounds = new L.LatLngBounds([]);

        this.props.routePaths.forEach((routePath) => {
            if (routePath.visible) {
                const geoJSON = L.geoJSON(routePath.geoJson);
                if (!bounds) {
                    bounds = geoJSON.getBounds();
                } else {
                    bounds.extend(geoJSON.getBounds());
                }
            }
        });

        if (bounds.isValid()) {
            this.props.fitBounds(bounds);
        }
    }

    componentDidUpdate(prevProps: RouteLayerProps) {
        // Recalculate bounds if adding or removing routes
        if (
            prevProps.routePaths.map(rPath => rPath.internalRoutePathId).join(':')
            !== this.props.routePaths.map(rPath => rPath.internalRoutePathId).join(':')
        ) {
            this.calculateBounds();
        }
    }

    render() {
        return this.props.routePaths
            .map((routePath, index) => {
                return (
                    <Polyline
                        key={index}
                        positions={routePath.positions}
                        color={this.props.colors[index]}
                    />
                );
            });
    }
}
