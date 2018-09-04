import React, { Component } from 'react';
import { INode } from '../../models';
import { Marker } from 'react-leaflet';
import * as L from 'leaflet';
import NodeType from '../../enums/nodeType';
import * as s from './nodeLayer.scss';
import { PopupStore } from '../../stores/popupStore';
import { ToolbarStore } from '../../stores/toolbarStore';
import { SidebarStore } from '../../stores/sidebarStore';
import { observer, inject } from 'mobx-react';
import ToolbarTools from '../../enums/toolbarTools';

interface NodeLayerProps {
    nodes: INode[];
    popupStore?: PopupStore;
    toolbarStore?: ToolbarStore;
    sidebarStore?: SidebarStore;
}

enum color {
    STOP_BORDER_COLOR = '#f17c44',
    CROSSROAD_BORDER_COLOR = '#666666',
    NORMAL_FILL_COLOR = '#FFF',
    SELECTED_FILL_COLOR = '#f44268',
}

@inject('popupStore', 'toolbarStore', 'sidebarStore')
@observer
export default class NodeLayer extends Component<NodeLayerProps> {
    constructor (props: NodeLayerProps) {
        super(props);
    }

    private getNodeMarkerHtml = (borderColor: string, fillColor: string) => {
        return `<div
            style="border-color: ${borderColor}; background-color: ${fillColor}"
            class=${s.nodeMarkerContent}
        />`;
    }

    private getIcon = (node: INode) => {
        const borderColor = node.type === NodeType.CROSSROAD
        ? color.CROSSROAD_BORDER_COLOR : color.STOP_BORDER_COLOR;
        const isSelected = node.id === this.props.sidebarStore!.openedNodeId;
        const fillColor = isSelected ? color.SELECTED_FILL_COLOR : color.NORMAL_FILL_COLOR;

        const divIconOptions : L.DivIconOptions = {
            className: s.nodeMarker,
            html: this.getNodeMarkerHtml(borderColor, fillColor),
        };

        return new L.DivIcon(divIconOptions);
    }

    render() {
        return this.props.nodes.map((node, index) => {
            const icon = this.getIcon(node);

            const openPopup = () => {
                this.props.popupStore!.showPopup(node);
            };

            return (
                <Marker
                    onContextMenu={openPopup}
                    draggable={this.props.toolbarStore!.isActive(ToolbarTools.Edit)}
                    icon={icon}
                    key={index}
                    position={[node.coordinates.lat, node.coordinates.lon]}
                />
            );
        });
    }
}
