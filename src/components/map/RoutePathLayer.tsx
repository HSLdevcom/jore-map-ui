import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import { IRoutePathLink } from '../../models';

interface RoutePathLayerProps {
    routePathLinks: IRoutePathLink[];
    onClick: Function;
    onContextMenu: Function;
    onMouseOver: Function;
    onMouseOut: Function;
    color: string;
    opacity: number;
    weight: number;
}

export default class RoutePathLayer extends Component<RoutePathLayerProps> {

    private onContextMenu = (routePathLinkId: number) => {
        this.props.onContextMenu(routePathLinkId);
    }

    render() {
        return this.props.routePathLinks
            .map((routePathLink, index) => {
                return (
                    <Polyline
                        positions={routePathLink.positions}
                        key={index}
                        color={this.props.color}
                        weight={this.props.weight}
                        opacity={this.props.opacity}
                        onClick={this.props.onClick}
                        onContextMenu={this.onContextMenu.bind(this, routePathLink.id)}
                        onMouseOver={this.props.onMouseOver}
                        onMouseOut={this.props.onMouseOut}
                    />
                );
            });
    }
}
