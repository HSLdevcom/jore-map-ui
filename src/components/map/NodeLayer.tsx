import React, { Component } from 'react';
import { INode } from '../../models';
import { Marker } from 'react-leaflet';
import * as L from 'leaflet';
import NodeType from '../../enums/nodeType';
import * as s from './nodeMarker.scss';
import { PopupStore } from '../../stores/popupStore';
import { ToolbarStore } from '../../stores/toolbarStore';
import { observer, inject } from 'mobx-react';
import ToolbarTools from '../../enums/toolbarTools';

interface NodeLayerProps {
    nodes: INode[];
    popupStore?: PopupStore;
    toolbarStore?: ToolbarStore;
}

@inject('popupStore', 'toolbarStore')
@observer
export default class NodeLayer extends Component<NodeLayerProps> {
    constructor (props: NodeLayerProps) {
        super(props);
    }

    private getNodeMarkerHtml = (color: string) => {
        return `<div
            style="border-color: ${color}"
            class=${s.nodeMarkerContent}
        />`;
    }

    private getIcon = (color: string) => {
        const divIconOptions : L.DivIconOptions = {
            className: s.nodeMarker,
            html: this.getNodeMarkerHtml(color),
        };

        return new L.DivIcon(divIconOptions);
    }

    render() {
        return this.props.nodes.map((node, index) => {
            const color =
                node.type === NodeType.CROSSROAD
                ? '#666666' : '#f17c44';
            const icon = this.getIcon(color);

            const openPopup = () => {
                this.props.popupStore!.showPopup(node);
            };

            return (
                <Marker
                    onContextMenu={openPopup}
                    draggable={this.props.toolbarStore!.isActive(ToolbarTools.Edit)}
                    icon={icon}
                    key={index}
                    position={[node.coordinates.lat, node.coordinates.lon]}
                />
            );
        });
    }
}
