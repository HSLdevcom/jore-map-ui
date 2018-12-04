import React, { Component } from 'react';
import { Marker, Circle } from 'react-leaflet';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { IStop } from '~/models';
import NodeType from '~/enums/nodeType';
import PinIcon from '~/icons/pin';
import { MapStore } from '~/stores/mapStore';
import * as s from './nodeMarker.scss';

// The logic of Z Indexes is not very logical.
// Setting z-index to 2, if other items is 1 wont force it to be on top.
// Setting z-index to a very high number will however most likely set the item on top.
// https://leafletjs.com/reference-1.3.4.html#marker-zindexoffset
const VERY_HIGH_Z_INDEX = 1000;

interface INodeMarkerProps {
    nodeType: NodeType;
    latLng: L.LatLng;
    isSelected?: boolean;
    color?: string;
    onContextMenu?: Function;
    onClick?: Function;
    isDraggable?: boolean;
    stop?: IStop;
    mapStore?: MapStore;
}

const DEFAULT_RADIUS = 25;
const HASTUS_MIN_ZOOM = 16;

@inject('mapStore')
@observer
export default class NodeMarker extends Component<INodeMarkerProps> {
    static defaultProps = {
        isSelected: false,
        isDraggable: false,
    };

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
        case NodeType.IS_NEIGHBOR: {
            return s.neighborMarker;
        }
        default: {
            return isSelected ? s.unknownMarkerHighlight : s.unknownMarker;
        }
        }
    }

    private renderMarker(html: any) {
        const divIconOptions : L.DivIconOptions = {
            html,
            className: s.node,
        };

        return new L.DivIcon(divIconOptions);
    }

    private renderStartMarker() {
        const color = this.props.color;
        if (!color) {
            throw new Error('Color should never be falsey when rendering start markers.');
        }

        const icon = this.renderMarker(PinIcon.getPin(color));
        return (
            <Marker
                zIndexOffset={VERY_HIGH_Z_INDEX}
                icon={icon}
                position={this.props.latLng}
            />
        );
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
        const nodeType = this.props.nodeType;
        if (nodeType === NodeType.START) {
            return this.renderStartMarker();
        }

        const icon = this.renderMarker(this.renderMarkerHtml());
        const displayCircle = this.props.isSelected && this.props.nodeType === NodeType.STOP;
        return (
            <Marker
                onContextMenu={this.props.onContextMenu}
                onClick={this.props.onClick}
                draggable={this.props.isDraggable}
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
