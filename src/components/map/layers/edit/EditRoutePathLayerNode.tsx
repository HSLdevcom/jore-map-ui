import { inject, observer } from 'mobx-react';
import React, { Component, ReactNode } from 'react';
import StartNodeType from '~/enums/startNodeType';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventHelper, {
    IEditRoutePathLayerNodeClickParams,
    INodeClickParams,
} from '~/helpers/EventHelper';
import { IRoutePathLink } from '~/models';
import INode from '~/models/INode';
import { MapStore } from '~/stores/mapStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import NodeUtils from '~/utils/NodeUtils';
import Marker from '../markers/Marker';
import NodeMarker, { NodeHighlightColor } from '../markers/NodeMarker';

const START_MARKER_COLOR = '#00df0b';

interface IRoutePathLayerProps {
    rpLink: IRoutePathLink;
    setExtendedListItem: (id: string | null) => void;
    isEndNodeRendered: boolean;
    routePathStore?: RoutePathStore;
    routePathLayerStore?: RoutePathLayerStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
}

@inject(
    'routePathStore',
    'routePathLayerStore',
    'toolbarStore',
    'mapStore',
    'routePathCopySegmentStore'
)
@observer
class EditRoutePathLayer extends Component<IRoutePathLayerProps> {
    private renderRoutePathLinkNodes = () => {
        const res: ReactNode[] = [];
        const rpLink = this.props.rpLink;
        const isDisabled = rpLink.startNodeType === StartNodeType.DISABLED;

        res.push(
            this.renderNode({
                isDisabled,
                node: rpLink.startNode,
                linkOrderNumber: rpLink.orderNumber,
                key: `startNode-${rpLink.startNode.id}`,
            })
        );
        if (this.props.isEndNodeRendered) {
            res.push(
                this.renderNode({
                    isDisabled: false, // End node has no disabled information
                    node: rpLink.endNode,
                    linkOrderNumber: rpLink.orderNumber,
                    key: `endNode-${rpLink.endNode.id}`,
                })
            );
        }
        return res;
    };

    private renderNode = ({
        node,
        linkOrderNumber,
        isDisabled,
        key,
    }: {
        node: INode;
        linkOrderNumber: number;
        isDisabled: boolean;
        key: string;
    }) => {
        const routePathLayerStore = this.props.routePathLayerStore;
        const highlightedExtendToolNodeIds = routePathLayerStore!.highlightedExtendToolNodeIds;
        const isNodeHighlightedByTool = highlightedExtendToolNodeIds.includes(node.id);
        let isNodeHighlighted;
        if (routePathLayerStore!.hoveredItemId) {
            isNodeHighlighted = routePathLayerStore!.hoveredItemId === node.internalId;
        } else {
            isNodeHighlighted = routePathLayerStore!.extendedListItemId === node.internalId;
        }

        // Click is disabled, if there are nodes highlighted by tool and the current node is not highlighted
        const isClickDisabled = highlightedExtendToolNodeIds.length > 0 && !isNodeHighlightedByTool;

        let onNodeClick;
        if (isNodeHighlightedByTool) {
            onNodeClick = () => {
                const clickParams: IEditRoutePathLayerNodeClickParams = {
                    node,
                    linkOrderNumber,
                };
                EventHelper.trigger('editRoutePathLayerNodeClick', clickParams);
            };
        } else {
            onNodeClick = () => {
                routePathLayerStore?.extendedListItemId === node.internalId
                    ? this.props.setExtendedListItem(null)
                    : this.props.setExtendedListItem(node.internalId);

                const clickParams: INodeClickParams = { node };
                EventHelper.trigger('nodeClick', clickParams);
            };
        }

        let isHighlighted = false;
        let highlightColor;
        if (isNodeHighlightedByTool) {
            isHighlighted = true;
            highlightColor = NodeHighlightColor.GREEN;
        } else if (isNodeHighlighted) {
            isHighlighted = true;
            highlightColor = NodeHighlightColor.BLUE;
        }

        return (
            <NodeMarker
                key={key}
                coordinates={node.coordinates}
                nodeType={node.type}
                transitTypes={node.transitTypes ? node.transitTypes : []}
                nodeLocationType={'coordinates'}
                nodeId={node.id}
                shortId={NodeUtils.getShortId(node)}
                hastusId={node.stop ? node.stop.hastusId : undefined}
                isHighlighted={isHighlighted}
                highlightColor={highlightColor}
                isDisabled={isDisabled}
                onClick={onNodeClick}
                isClickDisabled={isClickDisabled}
            />
        );
    };

    private renderStartMarker = () => {
        if (this.props.toolbarStore!.isSelected(ToolbarToolType.AddNewRoutePathLink)) {
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
                {this.renderRoutePathLinkNodes()}
                {this.renderStartMarker()}
            </>
        );
    }
}

export default EditRoutePathLayer;
