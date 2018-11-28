import React, { Component } from 'react';
import { Marker, Circle } from 'react-leaflet';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { INode } from '~/models';
import NodeType from '~/enums/nodeType';
import { PopupStore } from '~/stores/popupStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { MapStore } from '~/stores/mapStore';
import ToolbarTool from '~/enums/toolbarTool';
import * as s from './nodeLayer.scss';

interface MarkerLayerProps {
    node: INode | null;
    isDisabled: boolean;
    isTimeAlignmentStop: boolean;
    popupStore?: PopupStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
}

const DEFAULT_RADIUS = 25;
const HASTUS_MIN_ZOOM = 16;

@inject('popupStore', 'toolbarStore', 'mapStore')
@observer
export default class NodeLayer extends Component<MarkerLayerProps> {
    private getHastusLabel = (node: INode) => {
        if (node.stop && node.stop.hastusId && this.props.mapStore!.zoom >= HASTUS_MIN_ZOOM) {
            return `<div class=${s.hastusIdLabel}>
                ${node.stop.hastusId}
            </div>`;
        }
        return '';
    }

    private getMarkerHtml = (node: INode) => {
        return `<div class="${classnames(s.nodeBase, this.getMarkerClass(node))}">
                ${ this.getHastusLabel(node) }
            </div>`;
    }

    private getMarkerClass = (node: INode) => {
        const isSelected = this.isSelected(node);

        let type;
        if (this.props.isDisabled) {
            type = NodeType.DISABLED;
        } else if (this.props.isTimeAlignmentStop) {
            type = NodeType.TIME_ALIGNMENT;
        } else {
            type = node.type;
        }

        switch (type) {
        case NodeType.STOP: {
            return isSelected ? s.stopMarkerHighlight : s.stopMarker;
        }
        case NodeType.CROSSROAD: {
            return isSelected ? s.crossroadMarkerHighlight : s.crossroadMarker;
        }
        case NodeType.MUNICIPALITY_BORDER: {
            return isSelected ? s.municipalityMarkerHighlight : s.municipalityMarker;
        }
        case NodeType.DISABLED: {
            return isSelected ? s.disabledMarkerHighlight : s.disabledMarker;
        }
        case NodeType.TIME_ALIGNMENT: {
            return s.timeAlignmentMarker;
        }
        default: {
            return isSelected ? s.unknownMarkerHighlight : s.unknownMarker;
        }
        }
    }

    private getIcon = (node: INode) => {
        const divIconOptions : L.DivIconOptions = {
            html: this.getMarkerHtml(node),
            className: s.node,
        };

        return new L.DivIcon(divIconOptions);
    }

    private isSelected(node: INode) {
        return this.props.mapStore!.selectedNodeId === node.id;
    }

    private getNodeStopCircle(node: INode, latLng: L.LatLng) {
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
