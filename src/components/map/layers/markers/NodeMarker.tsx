import classnames from 'classnames';
import * as L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Circle, Marker as LeafletMarker } from 'react-leaflet';
import NodeType from '~/enums/nodeType';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import NodeLocationType from '~/types/NodeLocationType';
import NodeHelper from '~/util/NodeHelper';
import LeafletUtils from '~/util/leafletUtils';
import MarkerPopup from './MarkerPopup';
import * as s from './nodeMarker.scss';

enum NodeHighlightColor {
    BLUE, // default color
    GREEN
}

interface INodeMarkerProps {
    coordinates: L.LatLng;
    nodeType: NodeType;
    isSelected: boolean;
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
    markerClasses?: string[];
    popupContent?: string; // static markup language (HTML)
    onContextMenu?: Function;
    onClick?: Function;
    onMoveMarker?: (coordinates: L.LatLng) => void;
    mapStore?: MapStore;
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

    markerRef: any;

    constructor(props: INodeMarkerProps) {
        super(props);
        this.markerRef = React.createRef<LeafletMarker>();
    }

    componentDidMount() {
        if (this.props.popupContent) {
            MarkerPopup.initPopup(this.props.popupContent, this.markerRef);
        }
    }

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
            isSelected
        } = this.props;
        const res = [...this.props.markerClasses!];
        res.push(s.nodeBase);
        res.push(
            NodeHelper.getNodeTypeClass(nodeType, {
                nodeLocationType,
                isNodeDisabled: isDisabled,
                isNodeTimeAlignment: isTimeAlignmentStop,
                isNodeHighlighted: isSelected
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

        if (!this.props.isSelected || nodeType !== NodeType.STOP || !radius) {
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
            onMoveMarker,
            onContextMenu
        } = this.props;
        return (
            <LeafletMarker
                ref={this.markerRef}
                onContextMenu={onContextMenu}
                onClick={this.onMarkerClick}
                draggable={isDraggable}
                icon={this.renderNodeMarkerIcon({ nodeLocationType })}
                position={coordinates}
                onDragEnd={onMoveMarker && this.onMoveMarker()}
                interactive={!isClickDisabled}
            >
                {this.renderStopRadiusCircle()}
            </LeafletMarker>
        );
    }
}

export default NodeMarker;

export { NodeHighlightColor };
