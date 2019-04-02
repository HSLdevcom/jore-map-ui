import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import { inject, observer } from 'mobx-react';
import IRoutePathLink from '~/models/IRoutePathLink';
import INode from '~/models/INode';
import { RoutePathStore, NeighborToAddType } from '~/stores/routePathStore';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import RoutePathLinkService from '~/services/routePathLinkService';
import INeighborLink from '~/models/INeighborLink';
import NodeMarker from './mapIcons/NodeMarker';
import * as s from './neighborLinkLayer.scss';

const USED_NEIGHBOR_COLOR = '#0dce0a';
const UNUSED_NEIGHBOR_COLOR = '#fc383a';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    mapStore?: MapStore;
}

@inject('routePathStore', 'mapStore')
@observer
class NeighborLinkLayer extends Component<IRoutePathLayerProps> {
    public hasNodeOddAmountOfNeighbors = (node: INode) => {
        const routePath = this.props.routePathStore!.routePath;
        return routePath!.routePathLinks!.filter(x => x.startNode.id === node.id).length
            !== routePath!.routePathLinks!.filter(x => x.endNode.id === node.id).length;
    }

    private renderNeighborNode = (node: INode, neighborLink: INeighborLink, key: number) => {
        return (
            <NodeMarker
                key={`${key}-${node.id}`}
                isSelected={this.props.mapStore!.selectedNodeId === node.id}
                onClick={this.addNeighborLinkToRoutePath(neighborLink.routePathLink)}
                markerClasses={[s.neighborMarker]}
                forcedVisibleNodeLabels={[NodeLabel.longNodeId]}
                color={neighborLink.usages.length > 0 ? USED_NEIGHBOR_COLOR : UNUSED_NEIGHBOR_COLOR}
                node={node}
            >
                <div className={s.usageAmount}>
                    {
                        neighborLink.usages.length > 9 ?
                            '9+' : neighborLink.usages.length
                    }
                </div>
            </NodeMarker>
        );
    }

    private renderNeighborLink = (neighborLink: INeighborLink) => {
        return (
            <Polyline
                positions={neighborLink.routePathLink.geometry}
                key={neighborLink.routePathLink.id}
                color={neighborLink.usages.length > 0 ? USED_NEIGHBOR_COLOR : UNUSED_NEIGHBOR_COLOR}
                weight={5}
                opacity={0.8}
                onClick={this.addNeighborLinkToRoutePath(neighborLink.routePathLink)}
            />
        );
    }

    private addNeighborLinkToRoutePath = (routePathLink: IRoutePathLink) => async () => {
        this.props.routePathStore!.addLink(routePathLink);
        const neighborToAddType = this.props.routePathStore!.neighborToAddType;
        const nodeToFetch = neighborToAddType === NeighborToAddType.AfterNode ?
            routePathLink.endNode : routePathLink.startNode;
        if (this.hasNodeOddAmountOfNeighbors(nodeToFetch)) {
            const queryResult = await RoutePathLinkService.fetchNeighborRoutePathLinks(
                nodeToFetch.id,
                routePathLink.orderNumber,
                this.props.routePathStore!.routePath!.transitType,
                this.props.routePathStore!.routePath!.routePathLinks,
            );
            if (queryResult) {
                this.props.routePathStore!.setNeighborRoutePathLinks(queryResult.neighborLinks);
                this.props.routePathStore!.setNeighborToAddType(queryResult.neighborToAddType);
            }
        }
    }

    render() {
        const neighborLinks = this.props.routePathStore!.neighborLinks;
        if (!neighborLinks) return;
        return neighborLinks.map((neighborLink, index) => {
            const neighborToAddType = this.props.routePathStore!.neighborToAddType;
            const nodeToRender = neighborToAddType === NeighborToAddType.AfterNode ?
              neighborLink.routePathLink.endNode : neighborLink.routePathLink.startNode;
            return (
                [
                    this.renderNeighborNode(nodeToRender, neighborLink, index),
                    this.renderNeighborLink(neighborLink),
                ]
            );
        });
    }
}

export default NeighborLinkLayer;
