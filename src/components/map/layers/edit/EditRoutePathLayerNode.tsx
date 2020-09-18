import { inject, observer } from 'mobx-react';
import React from 'react';
import EventListener, { IRoutePathNodeClickParams } from '~/helpers/EventListener';
import INode from '~/models/INode';
import { NodeLabel } from '~/stores/mapStore';
import NodeUtils from '~/utils/NodeUtils';
import NodeMarker from '../markers/NodeMarker';

interface IRoutePathLayerNodeProps {
    node: INode;
    isDisabled: boolean;
    linkOrderNumber: number;
    isHighlightedByTool: boolean;
    isHovered: boolean;
    isExtended: boolean;
    visibleNodeLabels: NodeLabel[];
    setHoveredItemId: (id: string | null) => void;
}

const EditRoutePathLayerNode = inject()(
    observer((props: IRoutePathLayerNodeProps) => {
        const renderNode = ({ node, isDisabled }: { node: INode; isDisabled: boolean }) => {
            const isHighlightedByTool = props.isHighlightedByTool;
            const isExtended = props.isExtended;
            const isHovered = props.isHovered;
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
                    visibleNodeLabels={props.visibleNodeLabels}
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
            props.setHoveredItemId(props.node.internalId);
        };

        const onMouseLeaveNode = () => {
            if (props.isHovered) {
                props.setHoveredItemId(null);
            }
        };
        const { node, isDisabled } = props;
        return (
            <>
                {renderNode({
                    node,
                    isDisabled,
                })}
            </>
        );
    })
);

export default EditRoutePathLayerNode;
