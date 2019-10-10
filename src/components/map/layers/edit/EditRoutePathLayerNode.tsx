import { inject, observer } from 'mobx-react';
import React, { Component, ReactNode } from 'react';
import ToolbarTool from '~/enums/toolbarTool';
import INode from '~/models/INode';
import { MapStore } from '~/stores/mapStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import EventManager, {
    IEditRoutePathLayerNodeClickParams,
    INodeClickParams
} from '~/util/EventManager';
import Marker from '../markers/Marker';
import NodeMarker, { NodeHighlightColor } from '../markers/NodeMarker';

const START_MARKER_COLOR = '#00df0b';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
    highlightItemById: (id: string) => void;
}

@inject('routePathStore', 'toolbarStore', 'mapStore', 'routePathCopySegmentStore')
@observer
class EditRoutePathLayer extends Component<IRoutePathLayerProps> {
    private renderRoutePathNodes = () => {
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks || routePathLinks.length < 1) return;

        const res: ReactNode[] = [];
        routePathLinks.forEach((rpLink, index) => {
            // Render node which is lacking preceeding link
            if (index === 0 || routePathLinks[index - 1].endNode.id !== rpLink.startNode.id) {
                res.push(this.renderNode(rpLink.startNode, rpLink.orderNumber, index));
            }
            res.push(this.renderNode(rpLink.endNode, rpLink.orderNumber, index));
        });
        return res;
    };

    private renderNode = (node: INode, linkOrderNumber: number, index: number) => {
        const toolHighlightedNodeIds = this.props.routePathStore!.toolHighlightedNodeIds;
        const isNodeHighlightedByTool = toolHighlightedNodeIds.includes(node.id);
        const isNodeHighlightedByList = this.props.routePathStore!.listHighlightedNodeIds.includes(
            node.id
        );

        // Click is disabled, if there are nodes highlighted by tool and the current node is not highlighted
        const isClickDisabled = toolHighlightedNodeIds.length > 0 && !isNodeHighlightedByTool;

        let onNodeClick;
        if (isNodeHighlightedByTool) {
            onNodeClick = () => {
                const clickParams: IEditRoutePathLayerNodeClickParams = {
                    node,
                    linkOrderNumber
                };
                EventManager.trigger('editRoutePathLayerNodeClick', clickParams);
            };
        } else {
            onNodeClick = () => {
                this.props.highlightItemById(node.id);
                const clickParams: INodeClickParams = { node };
                EventManager.trigger('nodeClick', clickParams);
            };
        }

        const highlight = {
            isHighlighted: false,
            color: NodeHighlightColor.BLUE
        };
        if (isNodeHighlightedByTool) {
            highlight.isHighlighted = true;
            highlight.color = NodeHighlightColor.GREEN;
        } else if (isNodeHighlightedByList) {
            highlight.isHighlighted = true;
            highlight.color = NodeHighlightColor.BLUE;
        }

        return (
            <NodeMarker
                key={`${node.id}-${index}`}
                isSelected={this.props.mapStore!.selectedNodeId === node.id}
                onClick={onNodeClick}
                node={node}
                highlight={highlight}
                isClickDisabled={isClickDisabled}
            />
        );
    };

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
