import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Polyline } from 'react-leaflet';
import Moment from 'moment';
import { inject, observer } from 'mobx-react';
import IRoutePathLink from '~/models/IRoutePathLink';
import INode from '~/models/INode';
import { RoutePathStore, NeighborToAddType } from '~/stores/routePathStore';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import { IRoutePath } from '~/models';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import RoutePathNeighborLinkService from '~/services/routePathNeighborLinkService';
import INeighborLink from '~/models/INeighborLink';
import NodeMarker from '../markers/NodeMarker';
import * as s from './routePathNeighborLinkLayer.scss';

const USED_NEIGHBOR_COLOR = '#0dce0a';
const UNUSED_NEIGHBOR_COLOR = '#fc383a';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    mapStore?: MapStore;
}

@inject('routePathStore', 'mapStore')
@observer
class RoutePathNeighborLinkLayer extends Component<IRoutePathLayerProps> {
    public hasNodeOddAmountOfNeighbors = (node: INode) => {
        const routePath = this.props.routePathStore!.routePath;
        return (
            routePath!.routePathLinks.filter(x => x.startNode.id === node.id)
                .length !==
            routePath!.routePathLinks.filter(x => x.endNode.id === node.id)
                .length
        );
    };

    private getNodeUsageViewMarkup = (routePaths: IRoutePath[]) => {
        if (!routePaths || routePaths.length === 0) return;
        return ReactDOMServer.renderToStaticMarkup(
            <div className={s.nodeUsageList}>
                <div className={s.topic}>Solmua käyttävät reitinsuunnat</div>
                {routePaths
                    .slice()
                    .sort((a, b) => (a.routeId < b.routeId ? -1 : 1))
                    .map((routePath, index) => {
                        const link = routeBuilder
                            .to(SubSites.routePath)
                            .toTarget(':id',
                                [
                                    routePath.routeId,
                                    Moment(routePath.startTime).format(
                                        'YYYY-MM-DDTHH:mm:ss'
                                    ),
                                    routePath.direction
                                ].join(',')
                            )
                            .clear()
                            .toLink();
                        return (
                            <div className={s.usageListItem} key={index}>
                                <div className={s.usageListItemTitle}>
                                    {routePath.originFi}-
                                    {routePath.destinationFi}
                                </div>
                                <div className={s.usageListItemId}>
                                    <a href={link} target='_blank'>
                                        {routePath.routeId}
                                    </a>
                                </div>
                            </div>
                        );
                    })}
            </div>
        );
    };

    private renderNeighborNode = (
        node: INode,
        neighborLink: INeighborLink,
        key: number
    ) => {
        return (
            <NodeMarker
                key={`${key}-${node.id}`}
                isSelected={this.props.mapStore!.selectedNodeId === node.id}
                onClick={this.addNeighborLinkToRoutePath(
                    neighborLink.routePathLink
                )}
                markerClasses={[s.neighborMarker]}
                forcedVisibleNodeLabels={[NodeLabel.longNodeId]}
                popupContent={this.getNodeUsageViewMarkup(
                    neighborLink.nodeUsageRoutePaths
                )}
                color={
                    neighborLink.nodeUsageRoutePaths.length > 0
                        ? USED_NEIGHBOR_COLOR
                        : UNUSED_NEIGHBOR_COLOR
                }
                node={node}
            >
                <div className={s.usageCount}>
                    {neighborLink.nodeUsageRoutePaths.length > 9
                        ? '9+'
                        : neighborLink.nodeUsageRoutePaths.length}
                </div>
            </NodeMarker>
        );
    };

    private renderNeighborLink = (neighborLink: INeighborLink) => {
        return (
            <Polyline
                positions={neighborLink.routePathLink.geometry}
                key={neighborLink.routePathLink.id}
                color={
                    neighborLink.nodeUsageRoutePaths.length > 0
                        ? USED_NEIGHBOR_COLOR
                        : UNUSED_NEIGHBOR_COLOR
                }
                weight={5}
                opacity={0.8}
                onClick={this.addNeighborLinkToRoutePath(
                    neighborLink.routePathLink
                )}
            />
        );
    };

    private addNeighborLinkToRoutePath = (
        routePathLink: IRoutePathLink
    ) => async () => {
        this.props.routePathStore!.addLink(routePathLink);
        const neighborToAddType = this.props.routePathStore!.neighborToAddType;
        const nodeToFetch =
            neighborToAddType === NeighborToAddType.AfterNode
                ? routePathLink.endNode
                : routePathLink.startNode;
        if (this.hasNodeOddAmountOfNeighbors(nodeToFetch)) {
            const queryResult = await RoutePathNeighborLinkService.fetchNeighborRoutePathLinks(
                nodeToFetch.id,
                this.props.routePathStore!.routePath!,
                routePathLink.orderNumber
            );
            if (queryResult) {
                this.props.routePathStore!.setNeighborRoutePathLinks(
                    queryResult.neighborLinks
                );
                this.props.routePathStore!.setNeighborToAddType(
                    queryResult.neighborToAddType
                );
            }
        }
    };

    render() {
        const neighborLinks = this.props.routePathStore!.neighborLinks;
        return neighborLinks.map((neighborLink, index) => {
            const neighborToAddType = this.props.routePathStore!
                .neighborToAddType;
            const nodeToRender =
                neighborToAddType === NeighborToAddType.AfterNode
                    ? neighborLink.routePathLink.endNode
                    : neighborLink.routePathLink.startNode;
            return [
                this.renderNeighborNode(nodeToRender, neighborLink, index),
                this.renderNeighborLink(neighborLink)
            ];
        });
    }
}

export default RoutePathNeighborLinkLayer;
