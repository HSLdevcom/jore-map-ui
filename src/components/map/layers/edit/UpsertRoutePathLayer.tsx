import React, { Component, ReactNode } from 'react';
import { Polyline } from 'react-leaflet';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import IRoutePathLink from '~/models/IRoutePathLink';
import { createCoherentLinesFromPolylines } from '~/util/geomHelper';
import INode from '~/models/INode';
import { RoutePathStore, RoutePathViewTab, NeighborToAddType } from '~/stores/routePathStore';
import { MapStore, MapFilter } from '~/stores/mapStore';
import { ErrorStore } from '~/stores/errorStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import RoutePathLinkService from '~/services/routePathLinkService';
import ToolbarTool from '~/enums/toolbarTool';
import NodeMarker from '../mapIcons/NodeMarker';
import StartMarker from '../mapIcons/StartMarker';
import ArrowDecorator from '../ArrowDecorator';

const MARKER_COLOR = '#00df0b';
const NEIGHBOR_MARKER_COLOR = '#ca00f7';
const ROUTE_COLOR = '#000';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
    errorStore?: ErrorStore;
}

interface IRoutePathLayerState {
    focusedRoutePathId: string;
}

@inject('routePathStore', 'toolbarStore', 'mapStore', 'errorStore')
@observer
class UpsertRoutePathLayer extends Component<IRoutePathLayerProps, IRoutePathLayerState> {
    constructor(props: IRoutePathLayerProps) {
        super(props);

        this.state = {
            focusedRoutePathId: '',
        };
    }

    componentDidMount() {
        this.setBounds();
    }

    componentDidUpdate() {
        this.setBounds();
    }

    private defaultActionOnObjectClick = (id: string) => {
        // Switch to info tab
        this.props.routePathStore!.setActiveTab(RoutePathViewTab.List);
        // Close all extended objects, in order to be able to calculate final height of items
        this.props.routePathStore!.setExtendedObjects([]);
        // Set extended object, which will trigger automatic scroll
        this.props.routePathStore!.setExtendedObjects([id]);
        // Set highlight
        this.props.routePathStore!.setHighlightedObject(id);

    }

    private renderRoutePathLinks = () => {
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks || routePathLinks.length < 1) return;

        let res: ReactNode[] = [];
        routePathLinks.forEach((rpLink, index) => {
            // Render node which is lacking preceeding link
            if (index === 0 || routePathLinks[index - 1].endNode.id !== rpLink.startNode.id) {
                res.push(this.renderNode(rpLink.startNode, rpLink.orderNumber, index));
            }
            res = res.concat(this.renderLink(rpLink));
            res.push(this.renderNode(rpLink.endNode, rpLink.orderNumber, index));
        });
        return res;
    }

    public hasNodeOddAmountOfNeighbors = (node: INode) => {
        const routePath = this.props.routePathStore!.routePath;
        return routePath!.routePathLinks!.filter(x => x.startNode.id === node.id).length
            !== routePath!.routePathLinks!.filter(x => x.endNode.id === node.id).length;
    }

    private renderNode = (node: INode, linkOrderNumber: number, index: number) => {
        const selectedTool = this.props.toolbarStore!.selectedTool;

        let onNodeClick;
        let isNodeHighlighted;
        // Check if AddNewRoutePathLink is active
        if (selectedTool
            && selectedTool.onNodeClick
            && selectedTool.toolType === ToolbarTool.AddNewRoutePathLink
            && this.props.routePathStore!.neighborLinks.length === 0
        ) {
            isNodeHighlighted = this.hasNodeOddAmountOfNeighbors(node);
            // Allow click event for highlighted nodes only
            if (isNodeHighlighted) {
                onNodeClick = selectedTool.onNodeClick(node, linkOrderNumber);
            }
        } else {
            // Prevent default click if there are neighbors on map
            if (this.props.routePathStore!.neighborLinks.length === 0) {
                onNodeClick = () => this.defaultActionOnObjectClick(node.id);
                isNodeHighlighted = this.props.routePathStore!.isMapItemHighlighted(node.id);
            }
        }
        return (
            <NodeMarker
                key={`${node.id}-${index}`}
                isSelected={this.props.mapStore!.selectedNodeId === node.id}
                onClick={onNodeClick}
                node={node}
                isHighlighted={isNodeHighlighted}
            />
        );
    }

    private renderLink = (routePathLink: IRoutePathLink) => {
        const onRoutePathLinkClick =
            this.props.toolbarStore!.selectedTool &&
            this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick ?
                this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick!(routePathLink.id)
                : () => this.defaultActionOnObjectClick(routePathLink.id);

        return [
            (
                <Polyline
                    positions={routePathLink.geometry}
                    key={routePathLink.id}
                    color={ROUTE_COLOR}
                    weight={8}
                    opacity={0.8}
                    onClick={onRoutePathLinkClick}
                />
            ), this.props.routePathStore!.isMapItemHighlighted(routePathLink.id) &&
            (
                <Polyline
                    positions={routePathLink.geometry}
                    key={`${routePathLink.id}-highlight`}
                    color={ROUTE_COLOR}
                    weight={25}
                    opacity={0.5}
                    onClick={onRoutePathLinkClick}
                />
            ),
        ];
    }

    private renderRoutePathLinkNeighbors = () => {
        const routePathLinks = this.props.routePathStore!.neighborLinks;
        if (!routePathLinks) return;
        return routePathLinks.map((routePathLink: IRoutePathLink, index) => {
            const neighborToAddType = this.props.routePathStore!.neighborToAddType;
            const nodeToRender = neighborToAddType === NeighborToAddType.AfterNode ?
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
                isSelected={this.props.mapStore!.selectedNodeId === node.id}
                isNeighborMarker={true}
                onClick={this.addNeighborLinkToRoutePath(routePathLink)}
                node={node}
            />
        );
    }

    private renderNeighborLink = (routePathLink: IRoutePathLink) => {
        return (
            <Polyline
                positions={routePathLink.geometry}
                key={routePathLink.id}
                color={NEIGHBOR_MARKER_COLOR}
                weight={5}
                opacity={0.8}
                onClick={this.addNeighborLinkToRoutePath(routePathLink)}
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
            this.props.routePathStore!.setNeighborRoutePathLinks(queryResult!.routePathLinks);
            this.props.routePathStore!.setNeighborToAddType(queryResult!.neighborToAddType);
        }
    }

    private calculateBounds = () => {
        const bounds:L.LatLngBounds = new L.LatLngBounds([]);

        this.props.routePathStore!.routePath!.routePathLinks!.forEach((link) => {
            link.geometry
                .forEach(pos => bounds.extend(pos));
        });

        return bounds;
    }

    private setBounds = () => {
        const routePathStore = this.props.routePathStore!;

        if (routePathStore!.routePath) {
            // Only automatic refocus if user opened new routepath
            if (routePathStore!.routePath!.internalId !== this.state.focusedRoutePathId) {
                const bounds = this.calculateBounds();
                if (bounds.isValid()) {
                    this.props.mapStore!.setMapBounds(bounds);
                    this.setState({
                        focusedRoutePathId: routePathStore!.routePath!.internalId,
                    });
                }
            }
        } else if (this.state.focusedRoutePathId) {
            // Reset focused id if user clears the chosen routepath, if he leaves the routepathview
            this.setState({
                focusedRoutePathId: '',
            });
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

        return (
            <StartMarker
                latLng={routePathLinks![0].startNode.coordinates}
                color={MARKER_COLOR}
            />
        );
    }

    private renderLinkDecorator = () => {
        if (!this.props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)) return null;

        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks!;
        const coherentPolylines = createCoherentLinesFromPolylines(
            routePathLinks.map(rpLink => rpLink.geometry),
        );
        return coherentPolylines.map((polyline, index) => (
            <ArrowDecorator
                key={index}
                color={ROUTE_COLOR}
                geometry={polyline}
            />
        ));
    }

    render() {
        if (!this.props.routePathStore!.routePath) return null;
        return (
            <>
                {this.renderRoutePathLinks()}
                {this.renderLinkDecorator()}
                { this.props.toolbarStore!.isSelected(ToolbarTool.AddNewRoutePathLink) &&
                    this.renderRoutePathLinkNeighbors()
                }
                {this.renderStartMarker()}
            </>
        );
    }
}

export default UpsertRoutePathLayer;
