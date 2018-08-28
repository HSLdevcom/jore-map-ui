import React, { Component } from 'react';
import { INode } from '../../models';
import { Marker } from 'react-leaflet';
import * as L from 'leaflet';
import NodeType from '../../enums/nodeType';
import * as s from './nodeMarker.scss';

interface NodeLayerProps {
    nodes: INode[];
}

export default class NodeLayer extends Component<NodeLayerProps> {
    private getNodeMarkerHtml = (color: string) => {
        return `<div
            style="border-color: ${color};
            border-radius: 100px;
            border-style: solid;
            height: 12px;
            width: 12px;
            border-width: 3px;
            margin: -3px"
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

            return (
                <Marker
                    draggable={true}
                    icon={icon}
                    key={index}
                    position={[node.coordinates.lat, node.coordinates.lon]}
                />
            );
        });
    }
}
