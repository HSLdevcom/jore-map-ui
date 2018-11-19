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
import { MapStore } from '~/stores/mapStore';
import ToolbarTool from '~/enums/toolbarTool';
import * as s from './nodeLayer.scss';

interface MarkerLayerProps {
    node: INode | null;
    isDisabled: boolean;
    isTimeAlignmentStop: boolean;
    popupStore?: PopupStore;
    toolbarStore?: ToolbarStore;
    sidebarStore?: SidebarStore;
    mapStore?: MapStore;
}

const DEFAULT_RADIUS = 25;
const HASTUS_MIN_ZOOM = 16;

@inject('popupStore', 'toolbarStore', 'sidebarStore', 'mapStore')
@observer
export default class NodeLayer extends Component<MarkerLayerProps> {
    private getLabelHtml = (text: string) => {
        return `<div class=${s.hastusId}>
            ${text}
        </div>`;
    }

    private getMarkerHtml = (markerClass: string, children: string[]) => {
        return `<div class="${classnames(s.nodeBase, markerClass)}">
                ${
                    children
                }
            </div>`;
    }

    private getIcon = (node: INode) => {
        const isSelected = this.isSelected(node);
        const children = [];

        let type;
        if (this.props.isDisabled) {
            type = NodeType.DISABLED;
        } else if (this.props.isTimeAlignmentStop) {
            type = NodeType.TIME_ALIGNMENT;
        } else {
            type = node.type;
        }

        if (node.stop && node.stop.hastusId && this.props.mapStore!.zoom >= HASTUS_MIN_ZOOM) {
            children.push(
                this.getLabelHtml(node.stop.hastusId),
            );
        }

        let html;
        switch (type) {
        case NodeType.STOP: {
            html = this.getMarkerHtml(isSelected ? s.stopMarkerHighlight : s.stopMarker, children);
            break;
        }
        case NodeType.CROSSROAD: {
            html = this.getMarkerHtml(
                isSelected ? s.crossroadMarkerHighlight : s.crossroadMarker, children);
            break;
        }
        case NodeType.MUNICIPALITY_BORDER: {
            html = this.getMarkerHtml(
                isSelected ? s.municipalityMarkerHighlight : s.municipalityMarker, children);
            break;
        }
        case NodeType.DISABLED: {
            html = this.getMarkerHtml(
                isSelected ? s.disabledMarkerHighlight : s.disabledMarker, children);
            break;
        }
        case NodeType.TIME_ALIGNMENT: {
            html = this.getMarkerHtml(s.timeAlignmentMarker, children);
            break;
        }
        default: {
            html = this.getMarkerHtml(
                isSelected ? s.unknownMarkerHighlight : s.unknownMarker, children);
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
        return this.props.mapStore!.selectedNodeId === node.id;
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
        const displayCircle = this.isSelected(node) && node.type === NodeType.STOP;
        return (
            <Marker
                key={node.id}
                onContextMenu={openPopup}
                draggable={this.props.toolbarStore!.isActive(ToolbarTool.Edit)}
                icon={icon}
                position={latLng}
            >
            {
                (displayCircle) ?
                    this.getNodeStopCircle(node, latLng)
                : null
            }
            </Marker>
        );
    }
}
