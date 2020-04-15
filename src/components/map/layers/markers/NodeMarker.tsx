import classnames from 'classnames';
import * as L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Circle, Marker as LeafletMarker } from 'react-leaflet';
import NodeType from '~/enums/nodeType';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import { PopupStore } from '~/stores/popupStore';
import NodeLocationType from '~/types/NodeLocationType';
import NodeUtils from '~/utils/NodeUtils';
import LeafletUtils from '~/utils/leafletUtils';
import * as s from './nodeMarker.scss';

enum NodeHighlightColor {
    BLUE, // default color
    GREEN
}

interface INodeMarkerProps {
    coordinates: L.LatLng;
    nodeType: NodeType;
    isHighlighted: boolean;
    nodeLocationType: NodeLocationType;
    nodeId?: string;
    shortId?: string;
    hastusId?: string;
    radius?: number;
    color?: string;
    isDraggable?: boolean;
    isClickDisabled?: boolean;
    isDisabled?: boolean;
    isTimeAlignmentStop?: boolean;
    highlight?: { isHighlighted: boolean; color?: NodeHighlightColor };
    forcedVisibleNodeLabels?: NodeLabel[];
    hasHighZIndex?: boolean;
    markerClasses?: string[];
    onContextMenu?: Function;
    onMouseOver?: Function;
    onMouseOut?: Function;
    onClick?: Function;
    onMoveMarker?: (coordinates: L.LatLng) => void;
    mapStore?: MapStore;
    popupStore?: PopupStore;
}

const NODE_LABEL_MIN_ZOOM = 14;

@inject('mapStore')
@observer
class NodeMarker extends Component<INodeMarkerProps> {
    static defaultProps = {
        isDraggable: false,
        highlight: { isHighlighted: false },
        forcedVisibleNodeLabels: [],
        markerClasses: []
    };

    private onMoveMarker = () => (e: L.DragEndEvent) => {
        if (this.props.onMoveMarker) {
            this.props.onMoveMarker(e.target.getLatLng());
        }
    };

    private getLabels(): string[] {
        const { nodeId, hastusId, shortId } = this.props;
        const zoom = this.props.mapStore!.zoom;

        const visibleNodeLabels = _.union(
            this.props.mapStore!.visibleNodeLabels,
            this.props.forcedVisibleNodeLabels
        );

        if (visibleNodeLabels.length === 0 || zoom < NODE_LABEL_MIN_ZOOM) {
            return [];
        }

        const labels: string[] = [];
        if (hastusId && visibleNodeLabels.includes(NodeLabel.hastusId)) {
            labels.push(hastusId);
        }
        if (nodeId && visibleNodeLabels.includes(NodeLabel.longNodeId)) {
            labels.push(nodeId);
        }
        if (shortId && visibleNodeLabels.includes(NodeLabel.shortNodeId)) {
            labels.push(shortId);
        }

        return labels;
    }

    private getMarkerClasses = () => {
        const {
            nodeType,
            nodeLocationType,
            isDisabled,
            isTimeAlignmentStop,
            isHighlighted
        } = this.props;
        const res = [...this.props.markerClasses!];
        res.push(s.nodeBase);
        res.push(
            ...NodeUtils.getNodeTypeClasses(nodeType, {
                nodeLocationType,
                isNodeDisabled: isDisabled,
                isNodeTimeAlignment: isTimeAlignmentStop,
                isNodeHighlighted: isHighlighted
            })
        );

        const highlight = this.props.highlight;
        if (highlight && highlight.isHighlighted) {
            switch (highlight.color) {
                case NodeHighlightColor.BLUE: {
                    res.push(s.highlightBlue);
                    break;
                }
                case NodeHighlightColor.GREEN: {
                    res.push(s.highlightGreen);
                    break;
                }
                default: {
                    res.push(s.highlightBlue);
                }
            }
        }
        return res;
    };

    private renderMarkerLabel = () => {
        const labels = this.getLabels();
        if (!labels) return null;
        return (
            <div className={s.nodeLabel}>
                {labels.map((label, index) => {
                    return <div key={index}>{label}</div>;
                })}
            </div>
        );
    };

    private renderStopRadiusCircle = () => {
        const { nodeType, radius, coordinates } = this.props;

        if (nodeType !== NodeType.STOP || !radius) {
            return null;
        }

        return <Circle className={s.stopCircle} center={coordinates} radius={radius} />;
    };

    private onMarkerClick = () => {
        if (this.props.onClick) {
            this.props.onClick();
        }
    };

    private renderNodeMarkerIcon = ({
        nodeLocationType
    }: {
        nodeLocationType: NodeLocationType;
    }) => {
        const nodeBaseClass = this.props.isClickDisabled ? s.nodeNotClickable : s.node;

        return LeafletUtils.createDivIcon(
            <div
                className={classnames(...this.getMarkerClasses())}
                style={
                    nodeLocationType === 'coordinates'
                        ? {
                              borderColor: this.props.color,
                              backgroundColor: this.props.color
                          }
                        : undefined
                }
            >
                {this.props.children}
                {this.renderMarkerLabel()}
            </div>,
            {
                className: nodeBaseClass,
                popupOffset: -15
            }
        );
    };

    render() {
        const {
            coordinates,
            nodeLocationType,
            isDraggable,
            isClickDisabled,
            hasHighZIndex,
            onContextMenu,
            onMouseOver,
            onMouseOut,
            onMoveMarker
        } = this.props;
        return (
            <LeafletMarker
                onContextMenu={onContextMenu}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                onClick={this.onMarkerClick}
                draggable={isDraggable}
                icon={this.renderNodeMarkerIcon({ nodeLocationType })}
                position={coordinates}
                onDragEnd={onMoveMarker && this.onMoveMarker()}
                interactive={!isClickDisabled}
                zIndexOffset={hasHighZIndex ? 1000 : 0}
            >
                {this.renderStopRadiusCircle()}
            </LeafletMarker>
        );
    }
}

export default NodeMarker;

export { NodeHighlightColor };
