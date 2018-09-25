import React, { Component } from 'react';
import { Marker, Circle } from 'react-leaflet';
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

const DEFAULT_RADIUS = 25;

@inject('popupStore', 'toolbarStore', 'sidebarStore')
@observer
export default class NodeLayer extends Component<MarkerLayerProps> {
    private getNodeCrossroadMarkerHtml = (isSelected: boolean) => {
        const borderColor = isSelected ? '#727272' : '#727272';
        const fillColor = isSelected ? '#727272' : '#FFF';
        return `<div
            style="border-color: ${borderColor}; background-color: ${fillColor}"
            class=${s.nodeContent}
        />`;
    }

    private getNodeStopMarkerHtml = (isSelected: boolean) => {
        const borderColor = isSelected ? '#007ac9' : '#007ac9';
        const fillColor = isSelected ? '#007ac9' : '#FFF';
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
        return node.id === this.props.sidebarStore!.openNodeId;
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
        const radius = node.stop!.radius ? node.stop!.radius : DEFAULT_RADIUS;

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
