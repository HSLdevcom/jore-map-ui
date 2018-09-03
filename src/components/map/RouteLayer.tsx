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
    calculateBounds(nextProps: RouteLayerProps) {
        let bounds:L.LatLngBounds = new L.LatLngBounds([]);

        nextProps.routePaths.forEach((routePath) => {
            const geoJSON = L.geoJSON(routePath.geoJson);
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

    componentWillReceiveProps(nextProps: RouteLayerProps) {
        const routePathsChanged =
            nextProps.routePaths.map(rPath => rPath.internalId).join(':')
            !== this.props.routePaths.map(rPath => rPath.internalId).join(':');
        if (routePathsChanged) {
            this.calculateBounds(nextProps);
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
