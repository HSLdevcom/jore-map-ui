import React, { Component } from 'react';
import { Polyline, FeatureGroup } from 'react-leaflet';
import { observer, inject } from 'mobx-react';
import { IRoutePathLink } from '~/models';
import { PopupStore } from '~/stores/popupStore';
import NodeLayer from './NodeLayer';

interface RoutePathLinkLayerProps {
    popupStore?: PopupStore;
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

@inject('popupStore')
@observer
export default class RoutePathLayer extends Component<RoutePathLinkLayerProps> {

    private onContextMenu = (routePathLinkId: string) => () => {
        this.props.onContextMenu(routePathLinkId);
    }

    private renderRoutePathLinks() {
        const routePathLinks = this.props.routePathLinks;

        return routePathLinks.map((routePathLink, index) => {
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
        });
    }

    private renderNodes() {
        const routePathLinks = this.props.routePathLinks;

        return routePathLinks.map((routePathLink, index) => {

            if (index === routePathLinks.length - 1) {

                // TODO fix. get these from routePath link
                const isDisabled1 = false;
                const isTimeAlignmentStop1 = false;
                return (
                    <>
                        <NodeLayer
                            node={routePathLink.startNode}
                            isDisabled={isDisabled1}
                            isTimeAlignmentStop={isTimeAlignmentStop1}
                        />
                        <NodeLayer
                            node={routePathLink.endNode}
                            isDisabled={isDisabled1}
                            isTimeAlignmentStop={isTimeAlignmentStop1}
                        />
                    </>
                );
            }

            // TODO fix. get these from routePath link
            const isDisabled2 = false;
            const isTimeAlignmentStop2 = false;
            return (
                <NodeLayer
                    key={index}
                    node={routePathLink.endNode}
                    isDisabled={isDisabled2}
                    isTimeAlignmentStop={isTimeAlignmentStop2}
                />
            );
        });
    }

    render() {
        return (
            <FeatureGroup
                routePathInternalId={this.props.internalId}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
            >
                {this.renderRoutePathLinks()}
                {this.renderNodes()}
            </FeatureGroup>
        );
    }
}
