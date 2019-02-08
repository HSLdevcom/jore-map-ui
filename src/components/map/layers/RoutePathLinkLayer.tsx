import React, { Component } from 'react';
import { Polyline, FeatureGroup } from 'react-leaflet';
import { observer, inject } from 'mobx-react';
import { INode, IRoutePathLink } from '~/models';
import NodeType from '~/enums/nodeType';
import { PopupStore } from '~/stores/popupStore';
import NodeMarker from './mapIcons/NodeMarker';
import StartMarker from './mapIcons/StartMarker';

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
class RoutePathLinkLayer extends Component<RoutePathLinkLayerProps> {
    private onContextMenu = (routePathLinkId: string) => () => {
        this.props.onContextMenu(routePathLinkId);
    }

    private openPopup = (node: INode) => () => {
        this.props.popupStore!.showPopup(node);
    }

    private renderRoutePathLinks() {
        const routePathLinks = this.props.routePathLinks;
        return routePathLinks.map((routePathLink) => {
            return (
                <Polyline
                    positions={routePathLink.geometry}
                    key={routePathLink.id}
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
        const nodes = routePathLinks
            .map((routePathLink, index) => {
                return (
                    <NodeMarker
                        key={`${routePathLink.orderNumber}-${index}`}
                        node={routePathLink.startNode}
                        isDisabled={routePathLink.startNodeType === NodeType.DISABLED}
                        isTimeAlignmentStop={routePathLink.isStartNodeTimeAlignmentStop}
                        onContextMenu={this.openPopup(routePathLink.startNode)}
                    />
                );
            });
        const lastRoutePathLink = routePathLinks[routePathLinks.length - 1];
        nodes.push(
            <NodeMarker
                key='last-node'
                node={lastRoutePathLink.endNode}
                isDisabled={false} // Last node can't be disabled
                isTimeAlignmentStop={false} // Last node can't be a time alignment stop
                onContextMenu={this.openPopup(lastRoutePathLink.endNode)}
            />);
        return nodes;
    }

    private renderStartMarker() {
        const color = this.props.color;
        const routePathLinks = this.props.routePathLinks;
        if (routePathLinks!.length === 0) return;
        return (
            <StartMarker
                latLng={routePathLinks![0].startNode.coordinates}
                color={color}
            />
        );
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
                {this.renderStartMarker()}
            </FeatureGroup>
        );
    }
}

export default RoutePathLinkLayer;
