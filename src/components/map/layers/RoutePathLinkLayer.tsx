import React, { Component } from 'react';
import { Polyline, FeatureGroup } from 'react-leaflet';
import { observer, inject } from 'mobx-react';
import { IRoutePathLink } from '~/models';
import NodeType from '~/enums/nodeType';
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
        return routePathLinks.map((routePathLink, index) => {
            return (
                <div key={index}>
                    <NodeLayer
                        key={`${routePathLink.startNode.id}`}
                        node={routePathLink.startNode}
                        isDisabled={routePathLink.startNodeType === NodeType.DISABLED}
                        isTimeAlignmentStop={routePathLink.isStartNodeTimeAlignmentStop}
                    />
                    { index === routePathLinks.length - 1 &&
                        <NodeLayer
                            key={`${routePathLink.endNode.id}`}
                            node={routePathLink.endNode}
                            isDisabled={false}
                            isTimeAlignmentStop={false}
                        />
                    }
                </div>
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
