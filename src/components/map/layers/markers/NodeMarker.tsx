import classnames from 'classnames';
import * as L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Circle, Marker as LeafletMarker } from 'react-leaflet';
import NodeType from '~/enums/nodeType';
import { INode } from '~/models/index';
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
    mapStore?: MapStore;
    isSelected: boolean;
    color?: string;
    onContextMenu?: Function;
    onClick?: Function;
    isDraggable?: boolean;
    highlight?: { isHighlighted: boolean; color?: NodeHighlightColor };
    forcedVisibleNodeLabels?: NodeLabel[];
    markerClasses?: string[];
    // static markup language (HTML)
    popupContent?: string;
    node: INode;
    isClickDisabled?: boolean;
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

    private onMoveMarker = (coordinatesType: NodeLocationType) => (e: L.DragEndEvent) => {
        if (this.props.onMoveMarker) {
            this.props.onMoveMarker(coordinatesType, e.target.getLatLng());
        }
    };

    private getLabels(): string[] {
        const node = this.props.node;
        const zoom = this.props.mapStore!.zoom;

        const visibleNodeLabels = _.union(
            this.props.mapStore!.visibleNodeLabels,
            this.props.forcedVisibleNodeLabels
        );

        if (visibleNodeLabels.length === 0 || zoom < NODE_LABEL_MIN_ZOOM) {
            return [];
        }

        const labels: string[] = [];
        if (visibleNodeLabels.includes(NodeLabel.hastusId)) {
            if (node.stop && node.stop.hastusId) {
                labels.push(node.stop.hastusId);
            }
        }
        if (visibleNodeLabels.includes(NodeLabel.longNodeId)) {
            labels.push(node.id);
        }
        const nodeShortId = NodeHelper.getShortId(node);
        if (nodeShortId && visibleNodeLabels.includes(NodeLabel.shortNodeId)) {
            labels.push(nodeShortId);
        }

        return labels;
    }

    private getMarkerClasses = () => {
        const isSelected = this.props.isSelected;
        const res = [...this.props.markerClasses!];
        res.push(s.nodeBase);
        res.push(
            NodeHelper.getNodeTypeClass(this.props.node.type, {
                isNodeDisabled: this.props.isDisabled,
                isNodeTimeAlignment: this.props.isTimeAlignmentStop,
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
        const nodeType = this.props.node.type;

        if (
            !this.props.isSelected ||
            nodeType !== NodeType.STOP ||
            !this.props.node.stop ||
            !this.props.node.stop!.radius
        ) {
            return null;
        }

        return (
            <Circle
                className={s.stopCircle}
                center={this.props.node.coordinates}
                radius={this.props.node.stop!.radius}
            />
        );
    };

    private isDraggable = () =>
        // TODO this should probably check other stuff too...
        this.props.isSelected && this.props.isDraggable;

    private onMarkerClick = () => {
        if (this.props.onClick) {
            this.props.onClick();
        }
    };

    render() {
        const nodeBaseClass = this.props.isClickDisabled ? s.nodeNotClickable : s.node;

        const icon = LeafletUtils.createDivIcon(
            <div
                className={classnames(...this.getMarkerClasses())}
                style={{
                    borderColor: this.props.color,
                    backgroundColor: this.props.color
                }}
            >
                {this.props.children}
                {this.renderMarkerLabel()}
            </div>,
            {
                className: nodeBaseClass,
                popupOffset: -15
            }
        );

        return (
            <>
                <LeafletMarker
                    ref={this.markerRef}
                    onContextMenu={this.props.onContextMenu}
                    onClick={this.onMarkerClick}
                    draggable={this.props.isDraggable}
                    icon={icon}
                    position={this.props.node.coordinates}
                    onDragEnd={this.props.onMoveMarker && this.onMoveMarker('coordinates')}
                    interactive={!this.props.isClickDisabled}
                >
                    {this.renderStopRadiusCircle()}
                </LeafletMarker>
                {this.props.isSelected && this.props.node.type === NodeType.STOP && (
                    <LeafletMarker
                        position={this.props.node.coordinatesProjection}
                        icon={LeafletUtils.createDivIcon(
                            <div
                                className={classnames(s.projection, ...this.getMarkerClasses())}
                            />,
                            { className: nodeBaseClass }
                        )}
                        draggable={this.isDraggable()}
                        onDragEnd={
                            this.props.onMoveMarker && this.onMoveMarker('coordinatesProjection')
                        }
                        interactive={!this.props.isClickDisabled}
                    />
                )}
            </>
        );
    }
}

export default NodeMarker;

export { NodeHighlightColor };
