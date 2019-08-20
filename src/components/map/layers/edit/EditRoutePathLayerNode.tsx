import React, { Component, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import INode from '~/models/INode';
import { RoutePathStore } from '~/stores/routePathStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { MapStore } from '~/stores/mapStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import ToolbarTool from '~/enums/toolbarTool';
import RoutePathNeighborLinkService from '~/services/routePathNeighborLinkService';
import EventManager, { INodeClickParams } from '~/util/EventManager';
import NodeMarker from '../markers/NodeMarker';
import Marker from '../markers/Marker';

const START_MARKER_COLOR = '#00df0b';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
    highlightItemById: (id: string) => void;
}

@inject(
    'routePathStore',
    'toolbarStore',
    'mapStore',
    'routePathCopySegmentStore'
)
@observer
class EditRoutePathLayer extends Component<IRoutePathLayerProps> {
    private renderRoutePathNodes = () => {
        const routePathLinks = this.props.routePathStore!.routePath!
            .routePathLinks;
        if (!routePathLinks || routePathLinks.length < 1) return;

        const res: ReactNode[] = [];
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
        let isClickDisabled = false;
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
            } else {
                isClickDisabled = true;
            }
        } else {
            onNodeClick = () => {
                this.props.highlightItemById(node.id);
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
                isClickDisabled={isClickDisabled}
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

    render() {
        return (
            <>
                {this.renderRoutePathNodes()}
                {this.renderStartMarker()}
            </>
        );
    }
}

export default EditRoutePathLayer;
