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
const NEIGHBOR_MARKER_COLOR = '#ca00f7';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
}

@inject('routePathStore')
@observer
export default class RoutePathLayer extends Component<IRoutePathLayerProps> {
    private renderRoutePathLinks = () => {
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks) return;

        return routePathLinks.map((routePathLink: IRoutePathLink, index) => {
            const nodeToRender = routePathLink.startNode;
            return (
            <div key={index}>
                {this.renderNode(nodeToRender, index)}
                {/* Render last endNode of routePathLinks */}
                { (index === routePathLinks.length - 1) &&
                    this.renderNode(routePathLink.endNode, index)
                }
                {this.renderLink(routePathLink)}
            </div>
            );
        });
    }

    private renderNode = (node: INode, key: number) => {
        const latLng = L.latLng(node.coordinates.lat, node.coordinates.lon);
        return (
            <NodeMarker
                key={`${key}-${node.id}`}
                nodeType={node.type}
                onClick={void 0}
                latLng={latLng}
            />
        );
    }

    private renderLink = (routePathLink: IRoutePathLink) => {
        return (
            <Polyline
                positions={routePathLink.positions}
                key={routePathLink.id}
                color={MARKER_COLOR}
                weight={5}
                opacity={0.8}
                onClick={void 0}
            />
        );
    }

    private renderRoutePathLinkNeighbors = () => {
        const routePathLinks = this.props.routePathStore!.neighborLinks;
        if (!routePathLinks) return;

        return routePathLinks.map((routePathLink: IRoutePathLink, index) => {
            const nodeToRender = routePathLink.endNode;
            return (
            <div key={index}>
                {this.renderNeighborNode(nodeToRender, routePathLink, index)}
                {this.renderNeighborLink(routePathLink)}
            </div>
            );
        });
    }

    private renderNeighborNode = (node: INode, routePathLink: IRoutePathLink, key: number) => {
        const latLng = L.latLng(node.coordinates.lat, node.coordinates.lon);
        return (
            <NodeMarker
                key={`${key}-${node.id}`}
                isNeighborMarker={true}
                nodeType={node.type}
                onClick={this.addLinkToRoutePath(routePathLink)}
                latLng={latLng}
            />
        );
    }

    private renderNeighborLink = (routePathLink: IRoutePathLink) => {
        return (
            <Polyline
                positions={routePathLink.positions}
                key={routePathLink.id}
                color={NEIGHBOR_MARKER_COLOR}
                weight={5}
                opacity={0.8}
                onClick={this.addLinkToRoutePath(routePathLink)}
            />
        );
    }

    private addLinkToRoutePath = (routePathLink: IRoutePathLink) => async () => {
        const newRoutePathLinks =
            await RoutePathLinkService.fetchAndCreateRoutePathLinksWithStartNodeId(
                routePathLink.endNode.id);
        this.props.routePathStore!.setNeighborRoutePathLinks(newRoutePathLinks);
        this.props.routePathStore!.addLink(routePathLink);
    }

    private renderFirstNode = () => {
        if (this.props.routePathStore!.neighborLinks.length === 0) return null;

        const link = this.props.routePathStore!.neighborLinks[0];
        const firstNode = link.startNode;
        return this.renderNode(firstNode, 0);
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
        const neighborLinks =
            await RoutePathLinkService.fetchAndCreateRoutePathLinksWithStartNodeId(lastNode.id);
        this.props.routePathStore!.setNeighborRoutePathLinks(neighborLinks);
    }

    private renderStartMarker = () => {
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
                {this.renderRoutePathLinks()}
                {this.renderFirstNode()}
                {/* Neighbors should be drawn last */}
                {this.renderRoutePathLinkNeighbors()};
                {this.renderStartMarker()}
            </>
        );
    }
}
