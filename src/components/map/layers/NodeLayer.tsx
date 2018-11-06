import React, { Component } from 'react';
import { Marker, Circle } from 'react-leaflet';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { INode } from '~/models';
import NodeType from '~/enums/nodeType';
import { PopupStore } from '~/stores/popupStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { SidebarStore } from '~/stores/sidebarStore';
import ToolbarTool from '~/enums/toolbarTool';
import * as s from './nodeLayer.scss';

interface MarkerLayerProps {
    node: INode | null;
    isDisabled: boolean;
    isTimeAlignmentStop: boolean;
    popupStore?: PopupStore;
    toolbarStore?: ToolbarStore;
    sidebarStore?: SidebarStore;
}

const DEFAULT_RADIUS = 25;

@inject('popupStore', 'toolbarStore', 'sidebarStore', 'nodeStore')
@observer
export default class NodeLayer extends Component<MarkerLayerProps> {
    private getMarkerHtml = (markerClass: string) => {
        return `<div class="${classnames(s.nodeBase, markerClass)}" />`;
    }

    private getIcon = (node: INode) => {
        const isSelected = this.isSelected(node);

        let type;
        if (this.props.isDisabled) {
            type = NodeType.DISABLED;
        } else if (this.props.isTimeAlignmentStop) {
            type = NodeType.TIME_ALIGNMENT;
        } else {
            type = node.type;
        }

        let html;
        switch (type) {
        case NodeType.STOP: {
            html = this.getMarkerHtml(isSelected ? s.stopMarkerHighlight : s.stopMarker);
            break;
        }
        case NodeType.CROSSROAD: {
            html = this.getMarkerHtml(isSelected ? s.crossroadMarkerHighlight : s.crossroadMarker);
            break;
        }
        case NodeType.MUNICIPALITY_BORDER: {
            html = this.getMarkerHtml(isSelected ?
                s.municipalityMarkerHighlight : s.municipalityMarker);
            break;
        }
        case NodeType.DISABLED: {
            html = this.getMarkerHtml(isSelected ? s.disabledMarkerHighlight : s.disabledMarker);
            break;
        }
        case NodeType.TIME_ALIGNMENT: {
            html = this.getMarkerHtml(s.timeAlignmentMarker);
            break;
        }
        default: {
            html = this.getMarkerHtml(isSelected ? s.unknownMarkerHighlight : s.unknownMarker);
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
        // TODO: get this from some other store than nodeStore
        // const selectedNodeId
        // = this.props.nodeStore ? this.props.nodeStore!.selectedNodeId : null;
        // return node.id === selectedNodeId;
        return false;
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
        const node = this.props.node;
        if (!node) return;

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
    }
}
