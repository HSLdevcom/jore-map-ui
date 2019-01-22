import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Marker, Circle } from 'react-leaflet';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { ICoordinates, INode } from '~/models/index';
import NodeType from '~/enums/nodeType';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import GeometryService from '~/services/geometryService';
import { CoordinatesType } from '~/components/sidebar/nodeView/NodeView';
import * as s from './nodeMarker.scss';

// The logic of Z Indexes is not very logical.
// Setting z-index to 2, if other items is 1 wont force it to be on top.
// Setting z-index to a very high number will however most likely set the item on top.
// https://leafletjs.com/reference-1.3.4.html#marker-zindexoffset
export const VERY_HIGH_Z_INDEX = 1000;

export const createDivIcon = (html: React.ReactElement<any>) => {
    const renderedHtml = ReactDOMServer.renderToStaticMarkup(html);
    const divIconOptions : L.DivIconOptions = {
        html: renderedHtml,
        className: s.node,
    };

    return new L.DivIcon(divIconOptions);
};

export const testIcon = () => {
    return (createDivIcon(
        <div
            className={classnames(s.nodeBase, s.projection)}
        />,
    ));
};

interface INodeMarkerProps {
    mapStore?: MapStore;
    color?: string;
    onContextMenu?: Function;
    onClick?: Function;
    isDraggable?: boolean;
    isNeighborMarker?: boolean; // used for highlighting a node when creating new routePath
    node: INode;
    isDisabled?: boolean;
    isTimeAlignmentStop?: boolean;
    onMoveMarker?: (coordinatesType: CoordinatesType) => (coordinates: ICoordinates) => void;
}

const DEFAULT_RADIUS = 25;
const NODE_LABEL_MIN_ZOOM = 14;

@inject('mapStore')
@observer
class NodeMarker extends Component<INodeMarkerProps> {
    static defaultProps = {
        isDraggable: false,
        isNeighborMarker: false,
    };

    private onMoveMarker = (coordinatesType: CoordinatesType) => (e: L.DragEndEvent) => {
        const coordinates: ICoordinates = {
            lat:e.target.getLatLng().lat,
            lon:e.target.getLatLng().lng,
        };
        if (this.props.onMoveMarker) {
            this.props.onMoveMarker(coordinatesType)(coordinates);
        }
    }

    private isSelected(node?: INode) {
        if (node) return this.props.mapStore!.selectedNodeId === node.id;
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

    private getMarkerClass = () => {
        const isSelected = this.isSelected();
        if (this.props.isNeighborMarker) {
            return s.neighborMarker;
        }
        if (this.props.isDisabled) {
            return isSelected ? s.disabledMarkerHighlight : s.disabledMarker;
        }
        if (this.props.isTimeAlignmentStop) {
            return s.timeAlignmentMarker;
        }

        switch (this.props.node.type) {
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
        }

        return isSelected ? s.unknownMarkerHighlight : s.unknownMarker;
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

    private renderAdditionalLocations = (node: INode) => {
        const manual = GeometryService.iCoordinateToLatLng(node.coordinatesManual);
        const projection = GeometryService.iCoordinateToLatLng(node.coordinatesProjection);
        return (
            <>
                <Marker
                    position={manual}
                    icon={createDivIcon(
                        <div
                            className={classnames(s.nodeBase, s.manual, this.getMarkerClass())}
                        />,
                    )}
                    draggable={this.isInteractive(this.props.node)}
                    onDragEnd={this.props.onMoveMarker
                    && this.onMoveMarker('coordinatesManual')}
                />
                <Marker
                    position={projection}
                    icon={createDivIcon(
                        <div
                            className={classnames(s.nodeBase, s.projection, this.getMarkerClass())}
                        />,
                    )}
                    draggable={this.isInteractive(this.props.node)}
                    onDragEnd={this.props.onMoveMarker
                    && this.onMoveMarker('coordinatesProjection')}
                />
            </>
        );
    }

    private isInteractive = (node: INode) => (
        // TODO this should probably check other stuff too...
        this.isSelected(node) && this.props.isDraggable
    )

    render() {
        const nodeType = this.props.node.type;
        const latLng = GeometryService.iCoordinateToLatLng(this.props.node.coordinates);

        const icon = createDivIcon(
                <div className={classnames(s.nodeBase, this.getMarkerClass())}>
                    {this.renderMarkerLabel()}
                </div>,
        );
        const displayCircle = this.isSelected() && nodeType === NodeType.STOP;
        return (
            <>
                <Marker
                    onContextMenu={this.props.onContextMenu}
                    onClick={this.props.onClick}
                    draggable={this.isInteractive(this.props.node)}
                    icon={icon}
                    position={latLng}
                    onDragEnd={this.props.onMoveMarker
                    && this.onMoveMarker('coordinates')}
                >
                {
                    displayCircle ?
                        this.renderStopRadiusCircle(this.props.node.stop!.radius)
                    : null
                }
                </Marker>
                {this.isSelected(this.props.node)
                && this.renderAdditionalLocations(this.props.node!)}
            </>
        );
    }
}

export default NodeMarker;
