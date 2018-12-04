import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
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
        const zoom = this.props.mapStore!.zoom;
        const hastusId = this.props.stop ? this.props.stop!.hastusId : null;
        if (!hastusId || zoom < HASTUS_MIN_ZOOM) return null;

        return (
            <div className={s.hastusIdLabel}>
                {hastusId}
            </div>
        );
    }

    private renderMarkerHtml = () => {
        return (
            <div className={classnames(s.nodeBase, this.getMarkerClass())}>
                {this.renderMarkerLabel()}
            </div>
        );
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

    private renderMarker = (html: any) => {
        const divIconOptions : L.DivIconOptions = {
            html,
            className: s.node,
        };

        return new L.DivIcon(divIconOptions);
    }

    private renderStartMarker = () => {
        const latLng = this.props.latLng;
        const color = this.props.color;
        if (!color) {
            throw new Error('Color should never be falsey when rendering start markers.');
        }

        const icon = this.renderMarker(PinIcon.getPin(color));
        return (
            <Marker
                zIndexOffset={VERY_HIGH_Z_INDEX}
                icon={icon}
                position={latLng}
            />
        );
    }

    private renderStopRadiusCircle = (radius: number = DEFAULT_RADIUS) => {
        const latLng = this.props.latLng;
        return (
            <Circle
                className={s.stopCircle}
                center={latLng}
                radius={radius}
            />
        );
    }

    render() {
        const nodeType = this.props.nodeType;
        if (nodeType === NodeType.START) {
            return this.renderStartMarker();
        }

        const icon = this.renderMarker(
            ReactDOMServer.renderToStaticMarkup(this.renderMarkerHtml()),
        );
        const displayCircle = this.props.isSelected && nodeType === NodeType.STOP;
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
                    this.renderStopRadiusCircle(this.props.stop!.radius)
                : null
            }
            </Marker>
        );
    }
}
