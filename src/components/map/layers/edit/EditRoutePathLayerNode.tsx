import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventHelper, {
    IEditRoutePathLayerNodeClickParams,
    INodeClickParams,
} from '~/helpers/EventHelper';
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

interface IRoutePathLayerNodeProps {
    node: INode;
    isDisabled: boolean;
    linkOrderNumber: number;
    isAtCoherentRoutePathEdge: boolean;
    setExtendedListItem: (id: string | null) => void;
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
class EditRoutePathLayerNode extends Component<IRoutePathLayerNodeProps> {
    private renderNode = ({
        node,
        linkOrderNumber,
        isDisabled,
        isAtCoherentRoutePathEdge,
    }: {
        node: INode;
        linkOrderNumber: number;
        isDisabled: boolean;
        isAtCoherentRoutePathEdge: boolean;
    }) => {
        const routePathLayerStore = this.props.routePathLayerStore;
        let isNodeHighlighted;
        if (routePathLayerStore!.hoveredItemId) {
            isNodeHighlighted = routePathLayerStore!.hoveredItemId === node.internalId;
        } else {
            isNodeHighlighted = routePathLayerStore!.extendedListItemId === node.internalId;
        }
        const isExtendRpToolActive =
            this.props.toolbarStore!.selectedTool!.toolType === ToolbarToolType.ExtendRoutePath;
        const isCopyRpSegmentToolActive =
            this.props.toolbarStore!.selectedTool!.toolType ===
            ToolbarToolType.CopyRoutePathSegmentTool;
        const isHighlightedByRpTool =
            isAtCoherentRoutePathEdge && (isExtendRpToolActive || isCopyRpSegmentToolActive);
        let onNodeClick;
        if (isHighlightedByRpTool) {
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

                const clickParams: INodeClickParams = { nodeId: node.id };
                EventHelper.trigger('nodeClick', clickParams);
            };
        }

        let isHighlighted = false;
        let highlightColor;
        if (isHighlightedByRpTool) {
            isHighlighted = true;
            highlightColor = NodeHighlightColor.GREEN;
        } else if (isNodeHighlighted) {
            isHighlighted = true;
            highlightColor = NodeHighlightColor.BLUE;
        }

        return (
            <NodeMarker
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
            />
        );
    };

    private renderStartMarker = () => {
        if (this.props.toolbarStore!.isSelected(ToolbarToolType.ExtendRoutePath)) {
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
        const { node, linkOrderNumber, isDisabled, isAtCoherentRoutePathEdge } = this.props;
        return (
            <>
                {this.renderNode({
                    node,
                    linkOrderNumber,
                    isDisabled,
                    isAtCoherentRoutePathEdge,
                })}
                {this.renderStartMarker()}
            </>
        );
    }
}

export default EditRoutePathLayerNode;
