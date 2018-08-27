import React, { Component } from 'react';
import L from 'leaflet';
import { Polyline } from 'react-leaflet';
import { IRoute, IRoutePath } from '../../models';
import colorScale from '../../util/colorScale';

interface RouteLayerProps {
    routes: IRoute[];
    fitBounds: (bounds: L.LatLngBoundsExpression) => void;
}

export default class RouteLayer extends Component<RouteLayerProps> {
    private getFlattenRoutePaths = () => {
        return this.props.routes.reduce<IRoutePath[]>(
            (flatList, route) => {
                return flatList.concat(route.routePaths);
            },
            [],
        );
    }

    render() {
        const flattenRoutes = this.getFlattenRoutePaths();
        const visibleRoutes = flattenRoutes.filter(routePath => routePath.visible);
        const colors = colorScale.getColors(visibleRoutes.length);

        return visibleRoutes
            .map((routePath, index) => {
                return (
                    <Polyline
                        key={index}
                        positions={routePath.positions}
                        color={colors[index]}
                    />
                );
            });
    }

    getVisibleRoutesFootprint(routes: IRoute[]) {
        return routes.reduce(
            (list: string[], route: IRoute) => {
                return list.concat(
                    list,
                    route.routePaths
                        .filter(routePath => routePath.visible)
                        .map((routePath, index) => `${route.routeId}-${index}`),
                );
            },
            [],
        ).join(';');
    }

    calculateBounds() {
        let bounds:L.LatLngBounds = new L.LatLngBounds([]);

        this.props.routes.forEach((route) => {
            route.routePaths.forEach((routePath) => {
                if (routePath.visible) {
                    const geoJSON = L.geoJSON(routePath.geoJson);
                    if (!bounds) {
                        bounds = geoJSON.getBounds();
                    } else {
                        bounds.extend(geoJSON.getBounds());
                    }
                }
            });
        });

        if (bounds.isValid()) {
            this.props.fitBounds(bounds);
        }
    }

    componentDidUpdate(prevProps: RouteLayerProps) {
        // Recalculate bounds if adding or removing routes
        if (
            this.getVisibleRoutesFootprint(prevProps.routes)
            !== this.getVisibleRoutesFootprint(this.props.routes)
        ) {
            this.calculateBounds();
        }
    }
}
