import React, { Component } from 'react';
import { Polyline, FeatureGroup } from 'react-leaflet';
import { IRoutePathLink } from '~/models';

interface RoutePathLayerProps {
    internalId: string;
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

    private onContextMenu = (routePathLinkId: string) => () => {
        this.props.onContextMenu(routePathLinkId);
    }

    render() {
        return (
            <FeatureGroup
                routePathInternalId={this.props.internalId}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
            >
                {this.props.routePathLinks
                    .map((routePathLink, index) => {
                        return (
                            <Polyline
                                positions={routePathLink.positions}
                                key={index}
                                color={this.props.color}
                                weight={this.props.weight}
                                opacity={this.props.opacity}
                                onClick={this.props.onClick}
                                onContextMenu={this.onContextMenu(routePathLink.id)}
                            />
                        );
                    })}
            </FeatureGroup>
        );
    }
}
