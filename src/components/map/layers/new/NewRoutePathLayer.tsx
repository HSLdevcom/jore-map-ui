import React, { Component } from 'react';
import { Polyline, Marker } from 'react-leaflet';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import IRoutePathLink from '~/models/IRoutePathLink';
import INode from '~/models/INode';
import PinIcon from '~/icons/pin';
import NodeType from '~/enums/nodeType';
import { RoutePathStore } from '~/stores/routePathStore';
import RoutePathLinkService from '~/services/routePathLinkService';
import * as s from './newRoutePathLayer.scss';

// The logic of Z Indexes is not very logical.
// Setting z-index to 2, if other items is 1 wont force it to be on top.
// Setting z-index to a very high number will however most likely set the item on top.
// https://leafletjs.com/reference-1.3.4.html#marker-zindexoffset
const VERY_HIGH_Z_INDEX = 1000;

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

    private renderStartMarker() {
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks || !routePathLinks[0] || !routePathLinks[0].startNode) return null;

        const icon = this.getStartPointIcon();
        const coordinates = routePathLinks![0].startNode.coordinates;
        return (
            <Marker
                zIndexOffset={VERY_HIGH_Z_INDEX}
                icon={icon}
                position={[coordinates.lat, coordinates.lon]}
            />
        );
    }

    private getStartPointIcon = () => {
        const divIconOptions : L.DivIconOptions = {
            className: s.startMarker,
            html: PinIcon.getPin('#00df0b'),
        };

        return new L.DivIcon(divIconOptions);
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
