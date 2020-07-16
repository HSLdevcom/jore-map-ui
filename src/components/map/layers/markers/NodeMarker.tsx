import * as L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Circle, Marker as LeafletMarker } from 'react-leaflet';
import NodeSize from '~/enums/nodeSize';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import { PopupStore } from '~/stores/popupStore';
import NodeLocationType from '~/types/NodeLocationType';
import NodeUtils from '~/utils/NodeUtils';
import LeafletUtils from '~/utils/leafletUtils';
import * as s from './nodeMarker.scss';

enum NodeHighlightColor {
    BLUE, // default color
    GREEN,
}

interface INodeMarkerProps {
    coordinates: L.LatLng;
    nodeType: NodeType;
    nodeLocationType: NodeLocationType;
    transitTypes: TransitType[];
    isHighlighted?: boolean;
    highlightColor?: NodeHighlightColor;
    nodeId?: string;
    shortId?: string;
    hastusId?: string;
    radius?: number;
    color?: string;
    size?: NodeSize;
    isDraggable?: boolean;
    isClickDisabled?: boolean;
    isDisabled?: boolean;
    isTimeAlignmentStop?: boolean;
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
        forcedVisibleNodeLabels: [],
        markerClasses: [],
        highlightColor: NodeHighlightColor.BLUE,
        size: NodeSize.NORMAL,
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

    private getMarkerClasses = (): string[] => {
        const {
            nodeType,
            nodeLocationType,
            size,
            isDisabled,
            isTimeAlignmentStop,
            isHighlighted,
            highlightColor,
        } = this.props;
        const res = [...this.props.markerClasses!];
        res.push(size === NodeSize.NORMAL ? s.normalSize : s.smallSize);
        res.push(
            ...NodeUtils.getNodeTypeClasses(nodeType, {
                nodeLocationType,
                isNodeDisabled: isDisabled,
                isNodeTimeAlignment: isTimeAlignmentStop,
                isNodeHighlighted: isHighlighted,
            })
        );

        if (isHighlighted) {
            switch (highlightColor) {
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

        if (nodeType === NodeType.STOP) {
            // TODO: render all transitTypes (need to a new div to render into for each transitType color)
            const transitType = this.props.transitTypes[0];
            if (transitType === TransitType.BUS) {
                res.push(s.bus);
            } else if (transitType === TransitType.TRAM) {
                res.push(s.tram);
            } else if (transitType === TransitType.SUBWAY) {
                res.push(s.subway);
            } else if (transitType === TransitType.TRAIN) {
                res.push(s.train);
            } else if (transitType === TransitType.FERRY) {
                res.push(s.ferry);
            }
        }

        return res;
    };

    private renderMarkerLabel = () => {
        const labels = this.getLabels();
        if (!labels || labels.length === 0) return null;
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

    private onMarkerClick = (e: L.LeafletMouseEvent) => {
        if (this.props.onClick) {
            this.props.onClick(e);
        }
    };

    private renderNodeMarkerIcon = () => {
        const nodeRootClass = this.props.isClickDisabled ? s.nodeNotClickable : s.node;
        const markerLabel = this.renderMarkerLabel();
        return LeafletUtils.createDivIcon({
            html:
                markerLabel || this.props.children ? (
                    <>
                        {markerLabel}
                        {this.props.children}
                    </>
                ) : null,
            options: {
                classNames: [nodeRootClass, ...this.getMarkerClasses()],
                iconWidth:
                    this.props.size === NodeSize.SMALL
                        ? parseInt(s.iconFullWidthSmall, 10)
                        : parseInt(s.iconFullWidthNormal, 10),
                iconHeight:
                    this.props.size === NodeSize.SMALL
                        ? parseInt(s.iconFullWidthSmall, 10)
                        : parseInt(s.iconFullWidthNormal, 10),
                popupOffset: -15,
            },
        });
    };

    render() {
        const {
            coordinates,
            isDraggable,
            isClickDisabled,
            hasHighZIndex,
            onContextMenu,
            onMouseOver,
            onMouseOut,
            onMoveMarker,
        } = this.props;
        return (
            <LeafletMarker
                onContextMenu={onContextMenu}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                onClick={this.onMarkerClick}
                draggable={isDraggable}
                icon={this.renderNodeMarkerIcon()}
                position={coordinates}
                onDragEnd={onMoveMarker && this.onMoveMarker()}
                interactive={!Boolean(isClickDisabled)}
                zIndexOffset={hasHighZIndex ? 1000 : 0}
            >
                {this.renderStopRadiusCircle()}
            </LeafletMarker>
        );
    }
}

export default NodeMarker;

export { NodeHighlightColor };
