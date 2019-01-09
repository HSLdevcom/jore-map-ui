import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Marker, Circle } from 'react-leaflet';
import * as L from 'leaflet';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { IStop, INode } from '~/models/index';
import NodeType from '~/enums/nodeType';
import { MapStore, NodeLabel } from '~/stores/mapStore';
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
    nodeType: NodeType;
    latLng: L.LatLng;
    color?: string;
    onContextMenu?: Function;
    onClick?: Function;
    isDraggable?: boolean;
    stop?: IStop;
    labels?: string[];
    isNeighborMarker?: boolean; // used for highlighting a node when creating new routePath
    node: INode;
}

const DEFAULT_RADIUS = 25;
const NODE_LABEL_MIN_ZOOM = 14;

@inject('mapStore')
@observer
class NodeMarker extends Component<INodeMarkerProps> {
    static defaultProps = {
        isSelected: false,
        isDraggable: false,
        isNeighborMarker: false,
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

    private getMarkerClass = () => {
        const isSelected = this.isSelected();
        const nodeType = this.props.node.type;

        if (this.props.isNeighborMarker) {
            return s.neighborMarker;
        }

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
        default: {
            return isSelected ? s.unknownMarkerHighlight : s.unknownMarker;
        }
        }
    }

    private renderMarkerLabel = () => {
        const labels = this.getLabels();
        if (labels) return null;
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
        const latLng = this.props.latLng;
        return (
            <Circle
                className={s.stopCircle}
                center={latLng}
                radius={radius}
            />
        );
    }

    private renderAdditionalLocations(node: INode) {
        return null;
    }

    render() {
        const nodeType = this.props.nodeType;

        const icon = createDivIcon(
                <div className={classnames(s.nodeBase, this.getMarkerClass())}>
                    {this.renderMarkerLabel()}
                </div>,
        );
        const displayCircle = this.isSelected() && nodeType === NodeType.STOP;
        const displayLocations = this.isSelected();
        return (
            <>
                <Marker
                    onContextMenu={this.props.onContextMenu}
                    onClick={this.props.onClick}
                    draggable={this.props.isDraggable}
                    icon={icon}
                    position={this.props.latLng}
                >
                {
                    displayCircle ?
                        this.renderStopRadiusCircle(this.props.stop!.radius)
                    : null
                }
                </Marker>
                {
                    displayLocations ?
                        this.renderAdditionalLocations(this.props.node!)
                        : null
                }
            </>
        );
    }
}

export default NodeMarker;
