import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Marker, Circle } from 'react-leaflet';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { INode } from '~/models/index';
import NodeType from '~/enums/nodeType';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import GeometryService from '~/services/geometryService';
import NodeStyleHelper from '~/util/nodeTypeColorHelper';
import * as s from './nodeMarker.scss';

// The logic of Z Indexes is not very logical.
// Setting z-index to 2, if other items is 1 wont force it to be on top.
// Setting z-index to a very high number will however most likely set the item on top.
// https://leafletjs.com/reference-1.3.4.html#marker-zindexoffset
export const VERY_HIGH_Z_INDEX = 1000;

export const createDivIcon = (html: any) => {
    const renderedHtml = ReactDOMServer.renderToStaticMarkup(html);
    const divIconOptions : L.DivIconOptions = {
        html: renderedHtml,
        className: s.node,
    };

    return new L.DivIcon(divIconOptions);
};

interface INodeMarkerProps {
    mapStore?: MapStore;
    color?: string;
    onContextMenu?: Function;
    onClick?: Function;
    isDraggable?: boolean;
    isNeighborMarker?: boolean; // used for highlighting a node when creating new routePath
    isHighlighted?: boolean;
    node: INode;
    isDisabled?: boolean;
    isTimeAlignmentStop?: boolean;
}

const DEFAULT_RADIUS = 25;
const NODE_LABEL_MIN_ZOOM = 14;

@inject('mapStore')
@observer
class NodeMarker extends Component<INodeMarkerProps> {
    static defaultProps = {
        isDraggable: false,
        isNeighborMarker: false,
        isHighlighted: false,
    };

    private isSelected() {
        return this.props.mapStore!.selectedNodeId === this.props.node.id;
    }

    private getLabels(): string[] {
        const node = this.props.node;
        const visibleNodeLabels = this.props.mapStore!.visibleNodeLabels;
        const zoom = this.props.mapStore!.zoom;

        if (!node
            || visibleNodeLabels.length === 0
            || zoom < NODE_LABEL_MIN_ZOOM) return [];

        const labels: string[] = [];
        if (visibleNodeLabels.includes(NodeLabel.hastusId)) {
            if (node.stop && node.stop.hastusId) {
                labels.push(node.stop.hastusId);
            }
        }
        if (visibleNodeLabels.includes(NodeLabel.longNodeId)) {
            labels.push(node.id);
        }
        if (node.shortId && visibleNodeLabels.includes(NodeLabel.shortNodeId)) {
            labels.push(node.shortId);
        }

        return labels;
    }

    private getMarkerClasses = () => {
        const isSelected = this.isSelected();
        const res : string[] = [];
        if (this.props.isNeighborMarker) {
            res.push(s.neighborMarker);
        }
        if (this.props.isDisabled) {
            res.push(
                NodeStyleHelper.getTypeClass(NodeType.DISABLED, isSelected),
            );
        }
        if (this.props.isTimeAlignmentStop) {
            res.push(
                NodeStyleHelper.getTypeClass(NodeType.TIME_ALIGNMENT, isSelected),
            );
        }

        if (this.props.isHighlighted) {
            res.push(s.highlight);
        }

        res.push(
            NodeStyleHelper.getTypeClass(this.props.node.type, isSelected),
        );

        return res;
    }

    private renderMarkerLabel = () => {
        const labels = this.getLabels();
        if (!labels) return null;
        return (
            <div className={s.nodeLabel}>
                {labels.map((label, index) => {
                    return (
                        <div key={index}>{label}</div>
                    );
                })}
            </div>
        );
    }

    private renderStopRadiusCircle = (radius: number = DEFAULT_RADIUS) => {
        const latLng = GeometryService.iCoordinateToLatLng(this.props.node.coordinates);
        return (
            <Circle
                className={s.stopCircle}
                center={latLng}
                radius={radius}
            />
        );
    }

    render() {
        const nodeType = this.props.node.type;
        const latLng = GeometryService.iCoordinateToLatLng(this.props.node.coordinates);

        const icon = createDivIcon(
                <div className={classnames(s.nodeBase, ...this.getMarkerClasses())}>
                    {this.renderMarkerLabel()}
                </div>,
        );
        const displayCircle = this.isSelected() && nodeType === NodeType.STOP;
        return (
            <Marker
                onContextMenu={this.props.onContextMenu}
                onClick={this.props.onClick}
                draggable={this.props.isDraggable}
                icon={icon}
                position={latLng}
            >
            {
                displayCircle ?
                    this.renderStopRadiusCircle(this.props.node.stop!.radius)
                : null
            }
            </Marker>
        );
    }
}

export default NodeMarker;
