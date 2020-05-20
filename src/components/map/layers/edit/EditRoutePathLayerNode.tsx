import { inject, observer } from 'mobx-react';
import React, { Component, ReactNode } from 'react';
import StartNodeType from '~/enums/startNodeType';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventHelper, {
    IEditRoutePathLayerNodeClickParams,
    INodeClickParams,
} from '~/helpers/EventHelper';
import INode from '~/models/INode';
import { MapStore } from '~/stores/mapStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import NodeUtils from '~/utils/NodeUtils';
import Marker from '../markers/Marker';
import NodeMarker, { NodeHighlightColor } from '../markers/NodeMarker';

const START_MARKER_COLOR = '#00df0b';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
    setExtendedListItem: (id: string) => void;
}

@inject('routePathStore', 'toolbarStore', 'mapStore', 'routePathCopySegmentStore')
@observer
class EditRoutePathLayer extends Component<IRoutePathLayerProps> {
    private renderRoutePathNodes = () => {
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks || routePathLinks.length < 1) return;
        const res: ReactNode[] = routePathLinks.map((rpLink, index) => {
            const isDisabled = rpLink.startNodeType === StartNodeType.DISABLED;
            return this.renderNode({
                isDisabled,
                node: rpLink.startNode,
                linkOrderNumber: rpLink.orderNumber,
                key: `node-${index}`,
            });
        });

        const lastRoutePathLink = routePathLinks[routePathLinks.length - 1];
        res.push(
            this.renderNode({
                isDisabled: false, // Last routePath node can't be disabled
                node: lastRoutePathLink.endNode,
                linkOrderNumber: lastRoutePathLink.orderNumber,
                key: 'lastNode',
            })
        );

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
        const routePathStore = this.props.routePathStore;
        const toolHighlightedNodeIds = routePathStore!.toolHighlightedNodeIds;
        const isNodeHighlightedByTool = toolHighlightedNodeIds.includes(node.id);
        let isNodeHighlighted;
        if (routePathStore!.highlightedListItemId) {
            isNodeHighlighted = routePathStore!.highlightedListItemId === node.internalId;
        } else {
            isNodeHighlighted = routePathStore!.extendedListItemId === node.internalId;
        }

        // Click is disabled, if there are nodes highlighted by tool and the current node is not highlighted
        const isClickDisabled = toolHighlightedNodeIds.length > 0 && !isNodeHighlightedByTool;

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
                this.props.setExtendedListItem(node.internalId);
                const clickParams: INodeClickParams = { node };
                EventHelper.trigger('nodeClick', clickParams);
            };
        }

        const highlight = {
            isHighlighted: false,
            color: NodeHighlightColor.BLUE,
        };
        if (isNodeHighlightedByTool) {
            highlight.isHighlighted = true;
            highlight.color = NodeHighlightColor.GREEN;
        } else if (isNodeHighlighted) {
            highlight.isHighlighted = true;
            highlight.color = NodeHighlightColor.BLUE;
        }

        return (
            <NodeMarker
                key={key}
                coordinates={node.coordinates}
                nodeType={node.type}
                nodeLocationType={'coordinates'}
                nodeId={node.id}
                shortId={NodeUtils.getShortId(node)}
                hastusId={node.stop ? node.stop.hastusId : undefined}
                isHighlighted={false}
                isDisabled={isDisabled}
                onClick={onNodeClick}
                highlight={highlight}
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
                {this.renderRoutePathNodes()}
                {this.renderStartMarker()}
            </>
        );
    }
}

export default EditRoutePathLayer;
