import React, { Component } from 'react';
import L from 'leaflet';
import { Polyline } from 'react-leaflet';
import { IRoutePath } from '../../models';

interface RouteLayerProps {
    routePaths: IRoutePath[];
    colors: string[];
    map: any;
}

export default class RouteLayer extends Component<RouteLayerProps> {
    calculateBounds() {
        let bounds:L.LatLngBounds = new L.LatLngBounds([]);

        this.props.routePaths.forEach((routePath) => {
            const geoJSON = L.geoJSON(routePath.geoJson);
            if (!bounds) {
                bounds = geoJSON.getBounds();
            } else {
                bounds.extend(geoJSON.getBounds());
            }
        });
        if (bounds.isValid()) {
            if (this.props.map) {
                this.props.map!.leafletElement.fitBounds(bounds);
            }
        }
    }

    componentDidUpdate(prevProps: RouteLayerProps) {
        const routePathsChanged =
            prevProps.routePaths.map(rPath => rPath.internalId).join(':')
            !== this.props.routePaths.map(rPath => rPath.internalId).join(':');
        if (routePathsChanged) {
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
