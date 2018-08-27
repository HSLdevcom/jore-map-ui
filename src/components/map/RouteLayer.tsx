import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import { IRoute, IRoutePath } from '../../models';
import colorScale from '../../util/colorScale';

interface RouteLayerProps {
    routes: IRoute[];
}

export default class RouteLayer extends Component<RouteLayerProps> {
    private getNumberOfVisuals = () => {
        let visibleRoutePaths = 0;
        this.props.routes.forEach((route: IRoute) => {
            const routePathsAmount = route.routePaths.filter(
                x => x.visible).length;
            visibleRoutePaths += routePathsAmount;
        });
        return visibleRoutePaths;
    }

    private getFlattenRoutePaths = () => {
        return this.props.routes.reduce<IRoutePath[]>(
            (flatList, route) => {
                return flatList.concat(route.routePaths);
            },
            [],
        );
    }

    render() {
        const visualsAmount = this.getNumberOfVisuals();
        const colors = colorScale.getColors(visualsAmount);
        const flattenRoutes = this.getFlattenRoutePaths();

        return flattenRoutes.map((routePath, index) => {
            return (
                <Polyline
                    key={index}
                    positions={routePath.positions}
                    color={colors[index]}
                />
            );
        });
    }
}
