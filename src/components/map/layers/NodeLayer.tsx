import React, { Component } from 'react';
import { Marker } from 'react-leaflet';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import { INode } from '../../../models';
import NodeType from '../../../enums/nodeType';
import { PopupStore } from '../../../stores/popupStore';
import { ToolbarStore } from '../../../stores/toolbarStore';
import { SidebarStore } from '../../../stores/sidebarStore';
import ToolbarTool from '../../../enums/toolbarTool';
import * as s from './nodeLayer.scss';

interface MarkerLayerProps {
    nodes: INode[];
    popupStore?: PopupStore;
    toolbarStore?: ToolbarStore;
    sidebarStore?: SidebarStore;
}

export enum color {
    STOP_BORDER_COLOR = '#f17c44',
    CROSSROAD_BORDER_COLOR = '#666666',
    NORMAL_FILL_COLOR = '#FFF',
    SELECTED_FILL_COLOR = '#f44268',
}

@inject('popupStore', 'toolbarStore', 'sidebarStore')
@observer
export default class NodeLayer extends Component<MarkerLayerProps> {
    private getNodeMarkerHtml = (borderColor: string, fillColor: string) => {
        return `<div
            style="border-color: ${borderColor}; background-color: ${fillColor}"
            class=${s.nodeContent}
        />`;
    }

    private getIcon = (node: INode) => {
        const borderColor = node.type === NodeType.CROSSROAD
        ? color.CROSSROAD_BORDER_COLOR : color.STOP_BORDER_COLOR;
        const isSelected = node.id === this.props.sidebarStore!.openNodeId;
        const fillColor = isSelected ? color.SELECTED_FILL_COLOR : color.NORMAL_FILL_COLOR;

        const divIconOptions : L.DivIconOptions = {
            className: s.node,
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
                    draggable={this.props.toolbarStore!.isActive(ToolbarTool.Edit)}
                    icon={icon}
                    key={index}
                    position={[node.coordinates.lat, node.coordinates.lon]}
                />
            );
        });
    }
}
