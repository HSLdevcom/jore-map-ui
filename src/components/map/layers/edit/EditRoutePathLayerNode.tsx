import { inject, observer } from 'mobx-react';
import React from 'react';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventListener, { IRoutePathNodeClickParams } from '~/helpers/EventListener';
import INode from '~/models/INode';
import { MapStore } from '~/stores/mapStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import NodeUtils from '~/utils/NodeUtils';
import Marker from '../markers/Marker';
import NodeMarker from '../markers/NodeMarker';

const START_MARKER_COLOR = '#00df0b';

interface IRoutePathLayerNodeProps {
    node: INode;
    isDisabled: boolean;
    linkOrderNumber: number;
    routePathStore?: RoutePathStore;
    routePathLayerStore?: RoutePathLayerStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
}

const EditRoutePathLayerNode = inject(
    'routePathStore',
    'routePathLayerStore',
    'toolbarStore',
    'mapStore',
    'routePathCopySegmentStore'
)(
    observer((props: IRoutePathLayerNodeProps) => {
        const renderNode = ({ node, isDisabled }: { node: INode; isDisabled: boolean }) => {
            const routePathLayerStore = props.routePathLayerStore;
            const isHighlightedByTool = routePathLayerStore!.toolHighlightedNodeIds.includes(
                node.internalId
            );
            const isExtended = routePathLayerStore!.extendedListItemId === node.internalId;
            const isHovered = routePathLayerStore!.hoveredItemId === node.internalId;
            const isHighlighted = isHighlightedByTool || isExtended || isHovered;
            const highlightColor = isHovered
                ? 'yellow'
                : isHighlightedByTool
                ? 'green'
                : isExtended
                ? 'blue'
                : undefined;
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
                    onMouseOver={onMouseEnterNode}
                    onMouseOut={onMouseLeaveNode}
                />
            );
        };

        const onNodeClick = () => {
            const { node, linkOrderNumber } = props;
            const clickParams: IRoutePathNodeClickParams = {
                node,
                linkOrderNumber,
            };
            EventListener.trigger('routePathNodeClick', clickParams);
        };

        const onMouseEnterNode = () => {
            props.routePathLayerStore!.setHoveredItemId(props.node.internalId);
        };

        const onMouseLeaveNode = () => {
            if (props.routePathLayerStore!.hoveredItemId === props.node.internalId) {
                props.routePathLayerStore!.setHoveredItemId(null);
            }
        };

        const renderStartMarker = () => {
            if (props.toolbarStore!.isSelected(ToolbarToolType.ExtendRoutePath)) {
                // Hiding start marker if we set target node adding new links.
                // Due to the UI otherwise getting messy
                return null;
            }

            const routePathLinks = props.routePathStore!.routePath!.routePathLinks;
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

        const { node, isDisabled } = props;
        return (
            <>
                {renderNode({
                    node,
                    isDisabled,
                })}
                {renderStartMarker()}
            </>
        );
    })
);

export default EditRoutePathLayerNode;
