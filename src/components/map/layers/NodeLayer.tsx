import React, { Component } from 'react';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import { INode } from '~/models';
import NodeType from '~/enums/nodeType';
import { PopupStore } from '~/stores/popupStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import NodeMarker from './objects/NodeMarker';

interface INodeLayerProps {
    isDisabled: boolean;
    isTimeAlignmentStop: boolean;
    node?: INode;
    popupStore?: PopupStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
}

const NODE_LABEL_MIN_ZOOM = 14;

@inject('popupStore', 'toolbarStore', 'mapStore')
@observer
class NodeLayer extends Component<INodeLayerProps> {
    private isSelected(node: INode) {
        return this.props.mapStore!.selectedNodeId === node.id;
    }

    private getLabels(): string[] {
        const node = this.props.node;
        const visibleNodeLabels = this.props.mapStore!.visibleNodeLabels;
        const zoom = this.props.mapStore!.zoom;

        if (!node
            || visibleNodeLabels.length === 0
            || zoom < NODE_LABEL_MIN_ZOOM) return [];

        const labels: string[] = [];
        if (visibleNodeLabels.includes(NodeLabel.hastusId)) {
            if (node.stop && node.stop.hastusId) {
                labels.push(node.stop.hastusId);
            }
        }
        if (visibleNodeLabels.includes(NodeLabel.longNodeId)) {
            labels.push(node.id);
        }
        if (node.shortId && visibleNodeLabels.includes(NodeLabel.shortNodeId)) {
            labels.push(node.shortId);
        }

        return labels;
    }

    render() {
        const node = this.props.node;
        if (!node) return;

        const openPopup = () => {
            this.props.popupStore!.showPopup(node);
        };

        const latLng = L.latLng(node.coordinates.lat, node.coordinates.lon);

        let nodeType;
        if (this.props.isDisabled) {
            nodeType = NodeType.DISABLED;
        } else if (this.props.isTimeAlignmentStop) {
            nodeType = NodeType.TIME_ALIGNMENT;
        } else {
            nodeType = node.type;
        }
        return (
            <NodeMarker
                nodeType={nodeType}
                isSelected={this.isSelected(node)}
                labels={this.getLabels()}
                latLng={latLng}
                onContextMenu={openPopup}
                stop={node.stop ? node.stop : undefined}
            />
        );
    }
}

export default NodeLayer;
