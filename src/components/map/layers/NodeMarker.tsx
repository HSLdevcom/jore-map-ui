import React, { Component } from 'react';
import { Marker, Circle } from 'react-leaflet';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { IStop } from '~/models';
import NodeType from '~/enums/nodeType';
import { MapStore } from '~/stores/mapStore';
import * as s from './nodeLayer.scss';

interface INodeMarkerProps {
    nodeType: NodeType;
    isSelected: boolean;
    latLng: L.LatLng;
    color?: string;
    onContextMenu?: Function;
    isDraggable?: boolean;
    stop?: IStop;
    mapStore?: MapStore;
}

const DEFAULT_RADIUS = 25;
const HASTUS_MIN_ZOOM = 16;

@inject('mapStore')
@observer
export default class NodeLayer extends Component<INodeMarkerProps> {
    private renderMarkerLabel = () => {
        const stop = this.props.stop;
        if (!stop) return '';

        if (this.props.mapStore!.zoom >= HASTUS_MIN_ZOOM) {
            return `<div class=${s.hastusIdLabel}>
                ${stop.hastusId}
            </div>`;
        }
        return '';
    }

    private renderMarkerHtml = () => {
        return `<div class="${classnames(s.nodeBase, this.getMarkerClass())}">
                ${ this.renderMarkerLabel() }
            </div>`;
    }

    private getMarkerClass = () => {
        const isSelected = this.props.isSelected;
        const nodeType = this.props.nodeType;

        switch (nodeType) {
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

    private getIcon = () => {
        const divIconOptions : L.DivIconOptions = {
            html: this.renderMarkerHtml(),
            className: s.node,
        };

        return new L.DivIcon(divIconOptions);
    }

    private renderNodeStopCircle() {
        const stop = this.props.stop;
        if (!stop) return null;

        const radius = stop.radius ? stop.radius : DEFAULT_RADIUS;

        return (
            <Circle
                className={s.stopCircle}
                center={this.props.latLng}
                radius={radius}
            />
        );
    }

    render() {
        const icon = this.getIcon();

        const displayCircle = this.props.isSelected && this.props.nodeType === NodeType.STOP;
        return (
            <Marker
                onContextMenu={this.props.onContextMenu}
                draggable={Boolean(this.props.isDraggable)}
                icon={icon}
                position={this.props.latLng}
            >
            {
                (displayCircle) ?
                    this.renderNodeStopCircle()
                : null
            }
            </Marker>
        );
    }
}
