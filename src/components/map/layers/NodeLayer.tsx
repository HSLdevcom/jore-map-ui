import React, { Component } from 'react';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import { INode } from '~/models';
import NodeType from '~/enums/nodeType';
import { PopupStore } from '~/stores/popupStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { MapStore } from '~/stores/mapStore';
import NodeMarker from './NodeMarker';

interface INodeLayerProps {
    node: INode | null;
    isDisabled: boolean;
    isTimeAlignmentStop: boolean;
    popupStore?: PopupStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
}

@inject('popupStore', 'toolbarStore', 'mapStore')
@observer
class NodeLayer extends Component<INodeLayerProps> {
    private isSelected(node: INode) {
        return this.props.mapStore!.selectedNodeId === node.id;
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
                latLng={latLng}
                onContextMenu={openPopup}
                stop={node.stop ? node.stop : undefined}
            />
        );
    }
}

export default NodeLayer;
