import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import IRoutePathLink from '~/models/IRoutePathLink';
import INode from '~/models/INode';
import { RoutePathStore, AddLinkDirection } from '~/stores/routePathStore';
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

        const res: JSX.Element[] = [];
        routePathLinks.forEach((rpLink, index) => {
            const nextLink =
                index === routePathLinks.length - 1 ? undefined : routePathLinks[index + 1];

            if (index === 0 || routePathLinks[index - 1].endNode.id !== rpLink.startNode.id) {
                res.push(this.renderNode(rpLink.startNode, index, undefined, rpLink));
            }
            res.push(this.renderLink(rpLink));
            res.push(this.renderNode(rpLink.endNode, index, rpLink, nextLink));
        });
        return res;
    }

    private renderNode = (
        node: INode,
        index: number,
        previousRPLink?: IRoutePathLink,
        nextRPLink?: IRoutePathLink,
    ) => {
        let onNodeClick =
            this.props.toolbarStore!.selectedTool &&
            this.props.toolbarStore!.selectedTool!.onNodeClick ?
                this.props.toolbarStore!.selectedTool!.onNodeClick!(
                    node, previousRPLink, nextRPLink)
                : undefined;

        let isHighlighted = false;

        if (this.props.toolbarStore!.isSelected(ToolbarTool.AddNewRoutePathLink)) {
            if (this.props.routePathStore!.neighborLinks.length !== 0) {
                isHighlighted = false;
                onNodeClick = () => {};
            } else if (this.props.routePathStore!.isRoutePathNodeMissingNeighbour(node)) {
                isHighlighted = true;
            } else {
                onNodeClick = () => {};
            }
        }

        return (
            <NodeMarker
                key={`${node.id}-${index}`}
                onClick={onNodeClick}
                node={node}
                isHighlighted={isHighlighted}
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
            const direction = this.props.routePathStore!.addRoutePathLinkInfo.direction;
            const nodeToRender =
                direction === AddLinkDirection.AfterNode ?
                    routePathLink.endNode : routePathLink.startNode;
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
        this.props.routePathStore!.addLink(routePathLink);
        this.updateNeighbourLinks(routePathLink);
    }

    private updateNeighbourLinks = async (routePathLink: IRoutePathLink) =>  {
        const direction = this.props!.routePathStore!.addRoutePathLinkInfo.direction;

        const fixedNode =
            direction === AddLinkDirection.AfterNode
            ? routePathLink.endNode
            : routePathLink.startNode;

        const isMissingNeighbours =
            this.props!.routePathStore!.isRoutePathNodeMissingNeighbour(fixedNode);

        if (isMissingNeighbours) {
            const newRoutePathLinks =
            await RoutePathLinkService.fetchAndCreateRoutePathLinksWithNodeId(
                fixedNode.id,
                this.props.routePathStore!.addRoutePathLinkInfo.direction,
                routePathLink.orderNumber);
            this.props.routePathStore!.setNeighborRoutePathLinks(newRoutePathLinks);
        } else {
            this.props.routePathStore!.setNeighborRoutePathLinks([]);
        }
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

        if (
            routePathStore!.routePath &&
            this.props.toolbarStore!.selectedTool === undefined) {
            const bounds = this.calculateBounds();
            if (bounds.isValid()) {
                this.props.fitBounds(bounds);
            }
        }
    }

    private renderStartMarker = () => {
        if (this.props.toolbarStore!.isSelected(ToolbarTool.AddNewRoutePathLink)) {
            // Hiding start marker if we set target node adding new links.
            // Due to the UI otherwise getting messy
            return null;
        }

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
