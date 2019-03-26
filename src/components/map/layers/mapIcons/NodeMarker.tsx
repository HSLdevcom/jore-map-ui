import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Marker, Circle } from 'react-leaflet';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { INode } from '~/models/index';
import NodeLocationType from '~/types/NodeLocationType';
import NodeType from '~/enums/nodeType';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import EventManager from '~/util/EventManager';
import NodeTypeHelper from '~/util/nodeTypeHelper';
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
    isSelected: boolean;
    color?: string;
    onContextMenu?: Function;
    onClick?: Function;
    isDraggable?: boolean;
    isNeighborMarker?: boolean; // used for highlighting a node when creating new routePath
    isHighlighted?: boolean;
    onClickEventParams?: any;
    node: INode;
    isDisabled?: boolean;
    isTimeAlignmentStop?: boolean;
    onMoveMarker?: (coordinatesType: NodeLocationType, coordinates: L.LatLng) => void;
}

const NODE_LABEL_MIN_ZOOM = 14;

@inject('mapStore')
@observer
class NodeMarker extends Component<INodeMarkerProps> {
    static defaultProps = {
        isDraggable: false,
        isNeighborMarker: false,
        isHighlighted: false,
    };

    private onMoveMarker = (coordinatesType: NodeLocationType) => (e: L.DragEndEvent) => {
        if (this.props.onMoveMarker) {
            this.props.onMoveMarker(coordinatesType, e.target.getLatLng());
        }
    }

    private getLabels(): string[] {
        const node = this.props.node;
        const visibleNodeLabels = this.props.mapStore!.visibleNodeLabels;
        const zoom = this.props.mapStore!.zoom;

        if (!this.props.isNeighborMarker &&
            (visibleNodeLabels.length === 0
            || zoom < NODE_LABEL_MIN_ZOOM)) return [];

        const labels: string[] = [];
        if (visibleNodeLabels.includes(NodeLabel.hastusId)) {
            if (node.stop && node.stop.hastusId) {
                labels.push(node.stop.hastusId);
            }
        }
        if (visibleNodeLabels.includes(NodeLabel.longNodeId) || this.props.isNeighborMarker) {
            labels.push(node.id);
        }
        if (node.shortId && visibleNodeLabels.includes(NodeLabel.shortNodeId)) {
            labels.push(node.shortId);
        }

        return labels;
    }

    private getMarkerClasses = () => {
        const isSelected = this.props.isSelected;
        const res : string[] = [];
        if (this.props.isNeighborMarker) {
            res.push(s.neighborMarker);
        }
        if (this.props.isDisabled) {
            res.push(
                NodeTypeHelper.getTypeClass(NodeType.DISABLED, isSelected),
            );
        }
        if (this.props.isTimeAlignmentStop) {
            res.push(
                NodeTypeHelper.getTypeClass(NodeType.TIME_ALIGNMENT, isSelected),
            );
        }

        if (this.props.isHighlighted) {
            res.push(s.highlight);
        }

        res.push(
            NodeTypeHelper.getTypeClass(this.props.node.type, isSelected),
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

    private renderStopRadiusCircle = () => {
        const nodeType = this.props.node.type;

        if (!this.props.isSelected
            || nodeType !== NodeType.STOP
            || !this.props.node.stop
            || !this.props.node.stop!.radius) return null;

        return (
            <Circle
                className={s.stopCircle}
                center={this.props.node.coordinates}
                radius={this.props.node.stop!.radius}
            />
        );
    }

    private renderAdditionalLocations = (node: INode) => {
        return (
            <>
                <Marker
                    position={node.coordinatesManual}
                    icon={createDivIcon(
                        <div
                            className={
                                classnames(s.nodeBase, s.manual, ...this.getMarkerClasses())}
                        />,
                    )}
                    draggable={this.isInteractive()}
                    onDragEnd={this.props.onMoveMarker
                    && this.onMoveMarker('coordinatesManual')}
                />
                <Marker
                    position={node.coordinatesProjection}
                    icon={createDivIcon(
                        <div
                            className={
                                classnames(s.nodeBase, s.projection, ...this.getMarkerClasses())}
                        />,
                    )}
                    draggable={this.isInteractive()}
                    onDragEnd={this.props.onMoveMarker
                    && this.onMoveMarker('coordinatesProjection')}
                />
            </>
        );
    }

    private isInteractive = () => (
        // TODO this should probably check other stuff too...
        this.props.isSelected && this.props.isDraggable
    )

    private onMarkerClick = () => {
        if (this.props.onClick) {
            this.props.onClick();
        }
        if (this.props.onClickEventParams) {
            EventManager.trigger('nodeClick', this.props.onClickEventParams);
        }
    }

    render() {

        const icon = createDivIcon(
                <div className={classnames(s.nodeBase, ...this.getMarkerClasses())}>
                    {this.renderMarkerLabel()}
                </div>,
        );
        return (
            <>
                <Marker
                    onContextMenu={this.props.onContextMenu}
                    onClick={this.onMarkerClick}
                    draggable={this.props.isDraggable}
                    icon={icon}
                    position={this.props.node.coordinates}
                    onDragEnd={this.props.onMoveMarker
                    && this.onMoveMarker('coordinates')}
                >
                    {this.renderStopRadiusCircle()}
                </Marker>
                {
                    (
                        this.props.isSelected &&
                        this.props.node.type === NodeType.STOP
                    ) && this.renderAdditionalLocations(this.props.node!)}
            </>
        );
    }
}

export default NodeMarker;
