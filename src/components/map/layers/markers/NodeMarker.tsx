import * as L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Circle, Marker as LeafletMarker } from 'react-leaflet';
import NodeSize from '~/enums/nodeSize';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import { NodeLabel } from '~/stores/mapStore';
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
    visibleNodeLabels: NodeLabel[];
    isHighlighted?: boolean;
    highlightColor?: NodeHighlightColor;
    nodeId?: string;
    shortId?: string;
    hastusId?: string;
    radius?: number;
    size?: NodeSize;
    isDraggable?: boolean;
    isDisabled?: boolean;
    isTimeAlignmentStop?: boolean;
    hasHighZIndex?: boolean;
    classNames?: string[];
    onContextMenu?: Function;
    onMouseOver?: Function;
    onMouseOut?: Function;
    onClick?: Function;
    onMoveMarker?: (coordinates: L.LatLng) => void;
    children?: any;
}

const NodeMarker = inject()(
    observer(
        ({
            isDraggable = false,
            size = NodeSize.NORMAL,
            highlightColor = 'blue',
            ...props
        }: INodeMarkerProps) => {
            const _onMoveMarker = () => (e: L.DragEndEvent) => {
                if (props.onMoveMarker) {
                    props.onMoveMarker(e.target.getLatLng());
                }
            };

            const getLabels = (): string[] => {
                const { nodeId, hastusId, shortId, visibleNodeLabels = [] } = props;
                if (visibleNodeLabels.length === 0) {
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
            };

            const getclassNames = (): string[] => {
                const {
                    classNames = [],
                    nodeType,
                    nodeLocationType,
                    isDisabled,
                    isTimeAlignmentStop,
                    isHighlighted,
                } = props;
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
                        props.transitTypes.length > 0 ? props.transitTypes[0] : undefined;
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

                return [...res, ...classNames];
            };

            const renderMarkerLabel = () => {
                const labels = getLabels();
                if (!labels || labels.length === 0) return null;
                return (
                    <div className={s.nodeLabel}>
                        {labels.map((label, index) => {
                            return <div key={index}>{label}</div>;
                        })}
                    </div>
                );
            };

            const renderStopRadiusCircle = () => {
                const { nodeType, radius, coordinates } = props;

                if (nodeType !== NodeType.STOP || !radius) {
                    return null;
                }

                return <Circle className={s.stopCircle} center={coordinates} radius={radius} />;
            };

            const renderNodeMarkerIcon = () => {
                const nodeRootClass = Boolean(props.onClick) ? s.node : s.nodeNotClickable;
                const markerLabel = renderMarkerLabel();

                let iconWidth;
                switch (size) {
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
                        markerLabel || props.children ? (
                            <>
                                {markerLabel}
                                {props.children}
                            </>
                        ) : null,
                    options: {
                        iconWidth,
                        classNames: [nodeRootClass, ...getclassNames()],
                        iconHeight: iconWidth,
                        popupOffset: -15,
                    },
                });
            };

            const {
                coordinates,
                hasHighZIndex,
                onContextMenu,
                onClick,
                onMouseOver,
                onMouseOut,
                onMoveMarker,
            } = props;

            const onMarkerClick = (e: L.LeafletEvent) => {
                if (onClick) {
                    onClick(props.nodeId, e);
                }
            };

            return (
                <LeafletMarker
                    onContextMenu={onContextMenu ? () => onContextMenu(props.nodeId) : undefined}
                    onMouseOver={onMouseOver}
                    onMouseOut={onMouseOut}
                    onClick={onMarkerClick}
                    draggable={isDraggable}
                    icon={renderNodeMarkerIcon()}
                    position={coordinates}
                    onDragEnd={onMoveMarker && _onMoveMarker()}
                    interactive={Boolean(onClick)}
                    zIndexOffset={hasHighZIndex ? 1000 : 0}
                >
                    {renderStopRadiusCircle()}
                </LeafletMarker>
            );
        }
    )
);

export default NodeMarker;

export { NodeHighlightColor };
