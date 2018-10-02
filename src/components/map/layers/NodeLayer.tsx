import React, { Component } from 'react';
import { Marker, Circle } from 'react-leaflet';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import { INode } from '../../../models';
import NodeType from '../../../enums/nodeType';
import { PopupStore } from '../../../stores/popupStore';
import { ToolbarStore } from '../../../stores/toolbarStore';
import { SidebarStore } from '../../../stores/sidebarStore';
import { NodeStore } from '../../../stores/nodeStore';
import ToolbarTool from '../../../enums/toolbarTool';
import * as s from './nodeLayer.scss';

interface MarkerLayerProps {
    nodes: INode[];
    popupStore?: PopupStore;
    toolbarStore?: ToolbarStore;
    sidebarStore?: SidebarStore;
    nodeStore?: NodeStore;
}

const DEFAULT_RADIUS = 25;

enum color {
    CROSSROAD_BORDER_COLOR = '#727272',
    CROSSROAD_BORDER_COLOR_SELECTED = '#727272',
    CROSSROAD_FILL_COLOR = '#FFF',
    CROSSROAD_FILL_COLOR_SELECTED = '#727272',
    STOP_BORDER_COLOR = '#007ac9',
    STOP_BORDER_COLOR_SELECTED = '#007ac9',
    STOP_FILL_COLOR = '#FFF',
    STOP_FILL_COLOR_SELECTED = '#007ac9',
}

@inject('popupStore', 'toolbarStore', 'sidebarStore', 'nodeStore')
@observer
export default class NodeLayer extends Component<MarkerLayerProps> {
    private getNodeCrossroadMarkerHtml = (isSelected: boolean) => {
        const borderColor = isSelected ?
            color.CROSSROAD_BORDER_COLOR_SELECTED : color.CROSSROAD_BORDER_COLOR;
        const fillColor = isSelected ?
            color.CROSSROAD_FILL_COLOR_SELECTED : color.CROSSROAD_FILL_COLOR;
        return `<div
            style="border-color: ${borderColor}; background-color: ${fillColor}"
            class=${s.nodeContent}
        />`;
    }

    private getNodeStopMarkerHtml = (isSelected: boolean) => {
        const borderColor = isSelected ?
            color.STOP_BORDER_COLOR_SELECTED : color.STOP_BORDER_COLOR;
        const fillColor = isSelected ?
            color.STOP_FILL_COLOR_SELECTED : color.STOP_FILL_COLOR;
        return `<div
            style="border-color: ${borderColor}; background-color: ${fillColor}"
            class=${s.nodeContent}
        />`;
    }

    private getIcon = (node: INode) => {
        const isSelected = this.isSelected(node);

        let html;
        switch (node.type) {
        case NodeType.STOP: {
            html = this.getNodeStopMarkerHtml(isSelected);
            break;
        }
        case NodeType.CROSSROAD: {
            html = this.getNodeCrossroadMarkerHtml(isSelected);
            break;
        }
        default: {
            throw new Error(`NodeType not supported: ${node.type}!`);
            break;
        }
        }

        const divIconOptions : L.DivIconOptions = {
            html,
            className: s.node,
        };

        return new L.DivIcon(divIconOptions);
    }

    private isSelected(node: INode) {
        const selectedNodeId = this.props.nodeStore ? this.props.nodeStore!.selectedNodeId : null;
        return node.id === selectedNodeId;
    }

    private getNodeCrossroadCircle(node: INode, latLng :L.LatLng) {
        return (
            <Circle
                className={s.crossroadCircle}
                center={latLng}
                radius={DEFAULT_RADIUS}
            />
        );
    }

    private getNodeStopCircle(node: INode, latLng :L.LatLng) {
        const radius = (node.stop && node.stop!.radius) ? node.stop!.radius : DEFAULT_RADIUS;

        return (
            <Circle
                className={s.stopCircle}
                center={latLng}
                radius={radius}
            />
        );
    }

    render() {
        return this.props.nodes.map((node, index) => {
            const icon = this.getIcon(node);

            const openPopup = () => {
                this.props.popupStore!.showPopup(node);
            };

            const latLng = L.latLng(node.coordinates.lat, node.coordinates.lon);
            const displayCircle = this.isSelected(node);

            return (
                <Marker
                    onContextMenu={openPopup}
                    draggable={this.props.toolbarStore!.isActive(ToolbarTool.Edit)}
                    icon={icon}
                    key={index}
                    position={latLng}
                >
                {
                    (displayCircle && node.type === NodeType.STOP) ?
                        this.getNodeStopCircle(node, latLng)
                    : (displayCircle && node.type === NodeType.CROSSROAD) ?
                        this.getNodeCrossroadCircle(node, latLng)
                    : null
                }
                </Marker>
            );
        });
    }
}
