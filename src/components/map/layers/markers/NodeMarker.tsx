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
import NodeHighlightColor from '~/types/NodeHighlightColor';
import NodeLocationType from '~/types/NodeLocationType';
import NodeUtils from '~/utils/NodeUtils';
import LeafletUtils from '~/utils/leafletUtils';
import * as s from './nodeMarker.scss';

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
    isDisabled?: boolean;
    isTimeAlignmentStop?: boolean;
    forcedVisibleNodeLabels?: NodeLabel[];
    hasHighZIndex?: boolean;
    classNames?: string[];
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
        classNames: [],
        highlightColor: 'blue',
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

    private getclassNames = (): string[] => {
        const {
            nodeType,
            nodeLocationType,
            size,
            isDisabled,
            isTimeAlignmentStop,
            isHighlighted,
            highlightColor,
        } = this.props;
        const res = [];
        switch (size) {
            case NodeSize.SMALL:
                res.push(s.smallSize);
                break;
            case NodeSize.NORMAL:
                res.push(s.normalSize);
                break;
            case NodeSize.LARGE:
                res.push(s.largeSize);
                break;
        }
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
                case 'blue': {
                    res.push(s.highlightBlue);
                    break;
                }
                case 'green': {
                    res.push(s.highlightGreen);
                    break;
                }
                case 'yellow': {
                    res.push(s.highlightYellow);
                }
                default: {
                    res.push(s.highlightBlue);
                }
            }
        }

        if (nodeType === NodeType.STOP) {
            // TODO: render all transitTypes (need to a new div to render into for each transitType color)
            const transitType =
                this.props.transitTypes.length > 0 ? this.props.transitTypes[0] : undefined;
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
            } else {
                res.push(s.unusedStop);
            }
        }

        return [...res, ...this.props.classNames];
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

    private renderNodeMarkerIcon = () => {
        const nodeRootClass = Boolean(this.props.onClick) ? s.node : s.nodeNotClickable;
        const markerLabel = this.renderMarkerLabel();

        let iconWidth;
        switch (this.props.size) {
            case NodeSize.SMALL:
                iconWidth = parseInt(s.iconFullWidthSmall, 10);
                break;
            case NodeSize.NORMAL:
                iconWidth = parseInt(s.iconFullWidthNormal, 10);
                break;
            case NodeSize.LARGE:
                iconWidth = parseInt(s.iconFullWidthLarge, 10);
                break;
        }

        return LeafletUtils.createDivIcon({
            html:
                markerLabel || this.props.children ? (
                    <>
                        {markerLabel}
                        {this.props.children}
                    </>
                ) : null,
            options: {
                iconWidth,
                classNames: [nodeRootClass, ...this.getclassNames()],
                iconHeight: iconWidth,
                popupOffset: -15,
            },
        });
    };

    render() {
        const {
            coordinates,
            isDraggable,
            hasHighZIndex,
            onContextMenu,
            onClick,
            onMouseOver,
            onMouseOut,
            onMoveMarker,
        } = this.props;
        return (
            <LeafletMarker
                onContextMenu={onContextMenu}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                onClick={onClick}
                draggable={isDraggable}
                icon={this.renderNodeMarkerIcon()}
                position={coordinates}
                onDragEnd={onMoveMarker && this.onMoveMarker()}
                interactive={Boolean(onClick)}
                zIndexOffset={hasHighZIndex ? 1000 : 0}
            >
                {this.renderStopRadiusCircle()}
            </LeafletMarker>
        );
    }
}

export default NodeMarker;

export { NodeHighlightColor };
