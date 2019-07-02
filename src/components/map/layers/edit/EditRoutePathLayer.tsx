import React, { Component, ReactNode } from 'react';
import { Polyline } from 'react-leaflet';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import IRoutePathLink from '~/models/IRoutePathLink';
import { createCoherentLinesFromPolylines } from '~/util/geomHelper';
import INode from '~/models/INode';
import { RoutePathStore, RoutePathViewTab } from '~/stores/routePathStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { MapStore, MapFilter } from '~/stores/mapStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import RoutePathNeighborLinkService from '~/services/routePathNeighborLinkService';
import EventManager, { INodeClickParams } from '~/util/EventManager';
import NodeMarker from '../markers/NodeMarker';
import Marker from '../markers/Marker';
import ArrowDecorator from '../ArrowDecorator';
import RoutePathNeighborLinkLayer from './RoutePathNeighborLinkLayer';
import RoutePathCopySegmentLayer from './routePathCopySegmentLayer';

const START_MARKER_COLOR = '#00df0b';
const ROUTE_COLOR = '#000';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
}

interface IRoutePathLayerState {
    focusedRoutePathId: string;
}

@inject(
    'routePathStore',
    'toolbarStore',
    'mapStore',
    'routePathCopySegmentStore'
)
@observer
class EditRoutePathLayer extends Component<
    IRoutePathLayerProps,
    IRoutePathLayerState
> {
    constructor(props: IRoutePathLayerProps) {
        super(props);

        this.state = {
            focusedRoutePathId: ''
        };
    }

    componentDidMount() {
        this.setBounds();
    }

    componentDidUpdate() {
        this.setBounds();
    }

    private highlightItemById = (id: string) => {
        // Switch to info tab
        this.props.routePathStore!.setActiveTab(RoutePathViewTab.List);
        // Close all extended objects, in order to be able to calculate final height of items
        this.props.routePathStore!.setExtendedListItems([]);
        // Set extended object, which will trigger automatic scroll
        this.props.routePathStore!.setExtendedListItems([id]);
        // Set highlight
        this.props.routePathStore!.setHighlightedObject(id);
    };

    private renderRoutePathLinks = () => {
        const routePathLinks = this.props.routePathStore!.routePath!
            .routePathLinks;
        if (!routePathLinks || routePathLinks.length < 1) return;

        let res: ReactNode[] = [];
        routePathLinks.forEach((rpLink, index) => {
            // Render node which is lacking preceeding link
            if (
                index === 0 ||
                routePathLinks[index - 1].endNode.id !== rpLink.startNode.id
            ) {
                res.push(
                    this.renderNode(rpLink.startNode, rpLink.orderNumber, index)
                );
            }
            res = res.concat(this.renderLink(rpLink));
            res.push(
                this.renderNode(rpLink.endNode, rpLink.orderNumber, index)
            );
        });
        return res;
    };

    private renderNode = (
        node: INode,
        linkOrderNumber: number,
        index: number
    ) => {
        const selectedTool = this.props.toolbarStore!.selectedTool;

        const areNodesClickable =
            selectedTool &&
            ((selectedTool.toolType === ToolbarTool.AddNewRoutePathLink &&
                this.props.routePathStore!.neighborLinks.length === 0) ||
                selectedTool.toolType === ToolbarTool.CopyRoutePathSegmentTool);

        let onNodeClick;
        let isNodeHighlighted;
        // Check if AddNewRoutePathLink is active
        if (areNodesClickable) {
            isNodeHighlighted = this.props.routePathStore!.hasNodeOddAmountOfNeighbors(
                node.id
            );
            // Allow click event for highlighted nodes only
            if (isNodeHighlighted) {
                onNodeClick = () => {
                    this.fetchNeighborRoutePathLinks(node, linkOrderNumber);
                    const clickParams: INodeClickParams = { node };
                    EventManager.trigger('nodeClick', clickParams);
                };
            }
        } else {
            onNodeClick = () => {
                this.highlightItemById(node.id);
                const clickParams: INodeClickParams = { node };
                EventManager.trigger('nodeClick', clickParams);
            };
            isNodeHighlighted = this.props.routePathStore!.isMapItemHighlighted(
                node.id
            );
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
    };

    private fetchNeighborRoutePathLinks = async (
        node: INode,
        linkOrderNumber: number
    ) => {
        const queryResult = await RoutePathNeighborLinkService.fetchNeighborRoutePathLinks(
            node.id,
            this.props.routePathStore!.routePath!,
            linkOrderNumber
        );
        if (queryResult) {
            this.props.routePathStore!.setNeighborRoutePathLinks(
                queryResult.neighborLinks
            );
            this.props.routePathStore!.setNeighborToAddType(
                queryResult.neighborToAddType
            );
        }
    };

    private renderLink = (routePathLink: IRoutePathLink) => {
        const onRoutePathLinkClick =
            this.props.toolbarStore!.selectedTool &&
            this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick
                ? this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick!(
                      routePathLink.id
                  )
                : () => this.highlightItemById(routePathLink.id);

        return [
            <Polyline
                positions={routePathLink.geometry}
                key={routePathLink.id}
                color={ROUTE_COLOR}
                weight={5}
                opacity={0.8}
                onClick={onRoutePathLinkClick}
            />,
            this.props.routePathStore!.isMapItemHighlighted(
                routePathLink.id
            ) && (
                <Polyline
                    positions={routePathLink.geometry}
                    key={`${routePathLink.id}-highlight`}
                    color={ROUTE_COLOR}
                    weight={25}
                    opacity={0.5}
                    onClick={onRoutePathLinkClick}
                />
            )
        ];
    };

    private calculateBounds = () => {
        const bounds: L.LatLngBounds = new L.LatLngBounds([]);

        this.props.routePathStore!.routePath!.routePathLinks.forEach(link => {
            link.geometry.forEach(pos => bounds.extend(pos));
        });

        return bounds;
    };

    private setBounds = () => {
        const routePathStore = this.props.routePathStore!;

        if (routePathStore!.routePath) {
            // Only automatic refocus if user opened new routepath
            if (
                routePathStore!.routePath!.internalId !==
                this.state.focusedRoutePathId
            ) {
                const bounds = this.calculateBounds();
                if (bounds.isValid()) {
                    this.props.mapStore!.setMapBounds(bounds);
                    this.setState({
                        focusedRoutePathId: routePathStore!.routePath!
                            .internalId
                    });
                }
            }
        } else if (this.state.focusedRoutePathId) {
            // Reset focused id if user clears the chosen routepath, if he leaves the routepathview
            this.setState({
                focusedRoutePathId: ''
            });
        }
    };

    private renderStartMarker = () => {
        if (
            this.props.toolbarStore!.isSelected(ToolbarTool.AddNewRoutePathLink)
        ) {
            // Hiding start marker if we set target node adding new links.
            // Due to the UI otherwise getting messy
            return null;
        }

        const routePathLinks = this.props.routePathStore!.routePath!
            .routePathLinks;
        if (
            !routePathLinks ||
            routePathLinks.length === 0 ||
            !routePathLinks[0].startNode
        ) {
            return null;
        }

        return (
            <Marker
                latLng={routePathLinks[0].startNode.coordinates}
                color={START_MARKER_COLOR}
                isClickDisabled={true}
            />
        );
    };

    private renderLinkDecorator = () => {
        if (
            !this.props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)
        ) {
            return null;
        }

        const routePathLinks = this.props.routePathStore!.routePath!
            .routePathLinks;
        const coherentPolylines = createCoherentLinesFromPolylines(
            routePathLinks.map(rpLink => rpLink.geometry)
        );
        return coherentPolylines.map((polyline, index) => (
            <ArrowDecorator
                key={index}
                color={ROUTE_COLOR}
                geometry={polyline}
            />
        ));
    };

    render() {
        if (!this.props.routePathStore!.routePath) return null;

        const neighborLinks = this.props.routePathStore!.neighborLinks;
        const isRoutePathCopySegmentLayerVisible =
            this.props.routePathCopySegmentStore!.startNode ||
            this.props.routePathCopySegmentStore!.endNode;
        return (
            <>
                {this.renderRoutePathLinks()}
                {this.renderLinkDecorator()}
                {this.renderStartMarker()}
                {neighborLinks && <RoutePathNeighborLinkLayer />}
                {isRoutePathCopySegmentLayerVisible && (
                    <RoutePathCopySegmentLayer />
                )}
            </>
        );
    }
}

export default EditRoutePathLayer;
