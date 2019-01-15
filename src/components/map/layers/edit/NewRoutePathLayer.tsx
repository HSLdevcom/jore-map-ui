import React, { Component, ReactNode } from 'react';
import { Polyline } from 'react-leaflet';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import IRoutePathLink from '~/models/IRoutePathLink';
import INode from '~/models/INode';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import RoutePathLinkService from '~/services/routePathLinkService';
import ToolbarTool from '~/enums/toolbarTool';
import NodeMarker from '../mapIcons/NodeMarker';
import StartMarker from '../mapIcons/StartMarker';

const MARKER_COLOR = '#00df0b';
const NEIGHBOR_MARKER_COLOR = '#ca00f7';

interface IRoutePathLayerProps {
    fitBounds: (bounds: L.LatLngBoundsExpression) => void;
    routePathStore?: RoutePathStore;
    toolbarStore?:  ToolbarStore;
}

@inject('routePathStore', 'toolbarStore')
@observer
class NewRoutePathLayer extends Component<IRoutePathLayerProps> {
    private renderRoutePathLinks = () => {
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks || routePathLinks.length < 1) return;

        const res: ReactNode[] = [];
        routePathLinks.forEach((rpLink, index) => {
            if (index === 0 || routePathLinks[index - 1].endNode.id !== rpLink.startNode.id) {
                res.push(this.renderNode(rpLink.startNode));
            }
            res.push(this.renderLink(rpLink));
            res.push(this.renderNode(rpLink.endNode, rpLink));
        });
        return res;
    }

    private renderNode = (node: INode, previousRPLink?: IRoutePathLink) => {
        const onNodeClick =
            this.props.toolbarStore!.selectedTool &&
            this.props.toolbarStore!.selectedTool!.onNodeClick ?
                this.props.toolbarStore!.selectedTool!.onNodeClick!(node, previousRPLink)
                : undefined;

        return (
            <NodeMarker
                key={node.id}
                onClick={onNodeClick}
                node={node}
            />
        );
    }

    private renderLink = (routePathLink: IRoutePathLink) => {
        const onRoutePathLinkClick =
            this.props.toolbarStore!.selectedTool &&
            this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick ?
                this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick!(routePathLink.id)
                : undefined;

        return (
            <Polyline
                positions={routePathLink.positions}
                key={routePathLink.id}
                color={MARKER_COLOR}
                weight={5}
                opacity={0.8}
                onClick={onRoutePathLinkClick}
            />
        );
    }

    private renderRoutePathLinkNeighbors = () => {
        const routePathLinks = this.props.routePathStore!.neighborLinks;
        if (!routePathLinks) return;

        return routePathLinks.map((routePathLink: IRoutePathLink, index) => {
            const nodeToRender = routePathLink.endNode;
            return (
                [
                    this.renderNeighborNode(nodeToRender, routePathLink, index),
                    this.renderNeighborLink(routePathLink),
                ]
            );
        });
    }

    private renderNeighborNode = (node: INode, routePathLink: IRoutePathLink, key: number) => {
        return (
            <NodeMarker
                key={`${key}-${node.id}`}
                isNeighborMarker={true}
                onClick={this.addLinkToRoutePath(routePathLink)}
                node={node}
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
                routePathLink.endNode.id, routePathLink.orderNumber + 1);
        this.props.routePathStore!.setNeighborRoutePathLinks(newRoutePathLinks);
        this.props.routePathStore!.addLink(routePathLink);
    }

    private calculateBounds = () => {
        const bounds:L.LatLngBounds = new L.LatLngBounds([]);

        this.props.routePathStore!.routePath!.routePathLinks!.forEach((link) => {
            link.positions
                .forEach(pos => bounds.extend(new L.LatLng(pos[0], pos[1])));
        });

        return bounds;
    }

    private refresh = () => {
        const routePathStore = this.props.routePathStore!;

        if (routePathStore!.routePath
            && routePathStore!.routePath!.routePathLinks!.length > 0
            && routePathStore!.neighborLinks.length === 0) {
            this.getNeighborsForExistingRoutePath();
        }

        if (
            routePathStore!.routePath &&
            this.props.toolbarStore!.selectedTool === undefined) {
            const bounds = this.calculateBounds();
            if (bounds.isValid()) {
                this.props.fitBounds(bounds);
            }
        }
    }

    private async getNeighborsForExistingRoutePath() {
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks) {
            throw new Error('RoutePathLinks not found');
        }
        const lastRPLink = routePathLinks[routePathLinks.length - 1];
        const neighborLinks =
            await RoutePathLinkService.fetchAndCreateRoutePathLinksWithStartNodeId(
                lastRPLink.endNode.id,
                lastRPLink.orderNumber + 1);
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
            <StartMarker
                latLng={latLng}
                color={MARKER_COLOR}
            />
        );
    }

    componentDidUpdate() {
        this.refresh();
    }

    componentDidMount() {
        this.refresh();
    }

    render() {
        if (!this.props.routePathStore!.routePath) return null;
        return (
            <>
                {this.renderRoutePathLinks()}
                {/* Neighbors should be drawn last */}
                { this.props.toolbarStore!.isSelected(ToolbarTool.AddNewRoutePathLink) &&
                    this.renderRoutePathLinkNeighbors()
                }
                {this.renderStartMarker()}
            </>
        );
    }
}

export default NewRoutePathLayer;
