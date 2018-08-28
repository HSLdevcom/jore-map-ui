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
    getVisibleRoutesFootprint(routePaths: IRoutePath[]) {
        return routePaths.reduce(
            (list: string[], routePath: IRoutePath) => {
                list.push(
                    `${routePath.routeId}-${routePath.startTime}`,
                );
                return list;
            },
            []).join(';');
    }

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
            this.getVisibleRoutesFootprint(prevProps.routePaths)
            !== this.getVisibleRoutesFootprint(this.props.routePaths)
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
