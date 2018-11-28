import React, { Component } from 'react';
import { Polyline, Marker } from 'react-leaflet';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import IRoutePathLink from '~/models/IRoutePathLink';
import INode from '~/models/INode';
import NodeType from '~/enums/nodeType';
import { RoutePathStore } from '~/stores/routePathStore';
import { GeometryLogStore } from '~/stores/geometryLogStore';
import RoutePathLinkService from '~/services/routePathLinkService';
import * as s from './newRoutePathLayer.scss';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    geometryLogStore?: GeometryLogStore;
}

@inject('routePathStore', 'geometryLogStore')
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
        return (
            <Marker
                key={`${key}-${node.id}`}
                onClick={isNeighbor ? this.addLinkToRoutePath(routePathLink) : null}
                icon={this.getIcon({ isNeighbor }, node.type)}
                position={latLng}
            />
        );
    }

    private getIcon({ isNeighbor }: any, nodeType: NodeType) {
        const divIconOptions : L.DivIconOptions = {
            html: this.getMarkerHtml(isNeighbor, nodeType),
            className: s.node,
        };

        return new L.DivIcon(divIconOptions);
    }

    private getMarkerHtml = (isNeighbor: boolean, nodeType: NodeType) => {
        let className;

        if (isNeighbor) {
            className = s.neighborMarker;
        } else {
            switch (nodeType) {
            case NodeType.STOP: {
                className = s.newRoutePathMarker;
                break;
            }
            case NodeType.CROSSROAD: {
                className = s.crossroadMarker;
            }
            }
        }
        return `<div class="${classnames(
            s.nodeBase,
            className,
        )}" />`;
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
            </>
        );
    }
}
