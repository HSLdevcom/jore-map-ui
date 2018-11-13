import React, { Component } from 'react';
import { Polyline, Marker } from 'react-leaflet';
import { inject, observer } from 'mobx-react';
import IRoutePathLink from '~/models/IRoutePathLink';
import INode from '~/models/INode';
import NodeType from '~/enums/nodeType';
import * as L from 'leaflet';
import { RoutePathStore } from '~/stores/routePathStore';
import RoutePathLinkService from '~/services/routePathLinkService';
import classnames from 'classnames';
import * as s from './newRoutePathLayer.scss';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
}

@inject('routePathStore')
@observer
export default class RoutePathLayer extends Component<IRoutePathLayerProps> {
    private renderLinks(links: IRoutePathLink[]|null, { isNeighbor }: any) {
        if (!links) return;

        return links.map((routePathLink: IRoutePathLink, index) => {
            const nodeToRender = isNeighbor ? routePathLink.endNode : routePathLink.startNode;
            return (
            <div key={index}>
                {this.renderNode(nodeToRender, routePathLink, { isNeighbor }, index)}
                {/* Render last endNode of routePathLinks */}
                { (index === links.length - 1 && !isNeighbor) &&
                    this.renderNode(routePathLink.endNode, routePathLink, { isNeighbor }, index)
                }
                {this.renderLink(routePathLink, { isNeighbor })}
            </div>
            );
        });
    }

    private renderNode(node: INode, link: IRoutePathLink, { isNeighbor }: any, key: number) {
        const latLng = L.latLng(node.coordinates.lat, node.coordinates.lon);
        return (
            <Marker
                key={`${key}-${node.id}`}
                onClick={isNeighbor ? this.addLinkToRoutePath(link) : null}
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

    private renderLink(link: IRoutePathLink, { isNeighbor }: any) {
        const color = isNeighbor ? '#ca00f7' : '#00df0b';
        return (
            <Polyline
                positions={link.positions}
                key={link.id}
                color={color}
                weight={5}
                opacity={0.8}
                onClick={isNeighbor ? this.addLinkToRoutePath(link) : null}
            />
        );
    }

    private addLinkToRoutePath = (link: IRoutePathLink) => () => {
        RoutePathLinkService.fetchLinksWithLinkStartNodeId(link.endNode.id).then((links) => {
            this.props.routePathStore!.setNeighborLinks(links);
        });

        this.props.routePathStore!.addLink(link);
    }

    private renderFirstNode() {
        if (this.props.routePathStore!.neighborLinks.length === 0) return;

        const link = this.props.routePathStore!.neighborLinks[0];
        const firstNode = link.startNode;
        return this.renderNode(firstNode, link, { isNeighbor: false }, 0);
    }

    render() {
        if (!this.props.routePathStore!.routePath) return null;
        return (
            <>
                {this.renderLinks(
                    this.props.routePathStore!.routePath!.routePathLinks, { isNeighbor: false })}
                {this.props.routePathStore!.routePath!.routePathLinks!.length === 0 &&
                    this.renderFirstNode()
                }
                {/* Neighbors should be drawn last */}
                {this.renderLinks(
                    this.props.routePathStore!.neighborLinks, { isNeighbor: true })};
            </>
        );
    }
}
