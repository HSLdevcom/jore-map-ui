import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import IRoutePathLink from '~/models/IRoutePathLink';
import INode from '~/models/INode';
import NodeType from '~/enums/nodeType';
import { RoutePathStore } from '~/stores/routePathStore';
import RoutePathLinkService from '~/services/routePathLinkService';
import NodeMarker from '../NodeMarker';

const MARKER_COLOR = '#00df0b';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
}

@inject('routePathStore')
@observer
export default class RoutePathLayer extends Component<IRoutePathLayerProps> {
    private renderRoutePathLinks(
        routePathLinks: IRoutePathLink[]|null,
        { isNeighbor }: { isNeighbor: boolean }) {
        if (!routePathLinks) return;

        return routePathLinks.map((routePathLink: IRoutePathLink, index) => {
            const nodeToRender = isNeighbor ? routePathLink.endNode : routePathLink.startNode;
            return (
            <div key={index}>
                {this.renderNode(nodeToRender, routePathLink, { isNeighbor }, index)}
                {/* Render last endNode of routePathLinks */}
                { (index === routePathLinks.length - 1 && !isNeighbor) &&
                    this.renderNode(routePathLink.endNode, routePathLink, { isNeighbor }, index)
                }
                {this.renderLink(routePathLink, { isNeighbor })}
            </div>
            );
        });
    }

    private renderNode(
            node: INode,
            routePathLink: IRoutePathLink,
            { isNeighbor } : { isNeighbor: boolean },
            key: number) {
        const latLng = L.latLng(node.coordinates.lat, node.coordinates.lon);
        const nodeType = isNeighbor ? NodeType.IS_NEIGHBOR : node.type;

        return (
            <NodeMarker
                key={`${key}-${node.id}`}
                nodeType={nodeType}
                onClick={isNeighbor ? this.addLinkToRoutePath(routePathLink) : undefined}
                latLng={latLng}
            />
        );
    }

    private renderLink(routePathLink: IRoutePathLink, { isNeighbor }: any) {
        const color = isNeighbor ? '#ca00f7' : '#00df0b';
        return (
            <Polyline
                positions={routePathLink.positions}
                key={routePathLink.id}
                color={color}
                weight={5}
                opacity={0.8}
                onClick={isNeighbor ? this.addLinkToRoutePath(routePathLink) : null}
            />
        );
    }

    private addLinkToRoutePath = (routePathLink: IRoutePathLink) => async () => {
        const newRoutePathLinks =
            await RoutePathLinkService.fetchLinksWithLinkStartNodeId(routePathLink.endNode.id);
        this.props.routePathStore!.setNeighborRoutePathLinks(newRoutePathLinks);
        this.props.routePathStore!.addLink(routePathLink);
    }

    private renderFirstNode() {
        if (this.props.routePathStore!.neighborLinks.length === 0) return;

        const link = this.props.routePathStore!.neighborLinks[0];
        const firstNode = link.startNode;
        return this.renderNode(firstNode, link, { isNeighbor: false }, 0);
    }

    componentDidUpdate() {
        const routePathStore = this.props.routePathStore;

        if (routePathStore!.routePath
            && routePathStore!.routePath!.routePathLinks!.length > 0
            && routePathStore!.neighborLinks.length === 0) {
            this.getNeighborsForExistingRoutePath();
        }
    }

    private async getNeighborsForExistingRoutePath() {
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks) {
            throw new Error('RoutePathLinks not found');
        }
        const lastNode = routePathLinks[routePathLinks.length - 1].endNode;
        const neighborLinks = await RoutePathLinkService.fetchLinksWithLinkStartNodeId(lastNode.id);
        this.props.routePathStore!.setNeighborRoutePathLinks(neighborLinks);
    }

    private renderStartMarker() {
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks || routePathLinks.length === 0 || !routePathLinks[0].startNode) {
            return null;
        }

        const coordinates = routePathLinks![0].startNode.coordinates;
        const latLng = L.latLng(coordinates.lat, coordinates.lon);
        return (
            <NodeMarker
                nodeType={NodeType.START}
                latLng={latLng}
                color={MARKER_COLOR}
            />
        );
    }

    render() {
        if (!this.props.routePathStore!.routePath) return null;
        return (
            <>
                {this.renderRoutePathLinks(
                    this.props.routePathStore!.routePath!.routePathLinks, { isNeighbor: false })}
                {this.props.routePathStore!.routePath!.routePathLinks!.length === 0 &&
                    this.renderFirstNode()
                }
                {/* Neighbors should be drawn last */}
                {this.renderRoutePathLinks(
                    this.props.routePathStore!.neighborLinks, { isNeighbor: true })};
                {this.renderStartMarker()}
            </>
        );
    }
}
