import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import ILink from '~/models/ILink';
import { EditNetworkStore } from '~/stores/editNetworkStore';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import NodeMarker from '../objects/NodeMarker';

interface IEditNetworkLayerProps {
    editNetworkStore?: EditNetworkStore;
}

@inject('editNetworkStore')
@observer
class EditNetworkLayer extends Component<IEditNetworkLayerProps> {
    private renderLinks() {
        const links = this.props.editNetworkStore!.links;
        if (!links) return null;

        return links.map((link: ILink, index) => this.renderLink(link, index));
    }

    private renderLink(link: ILink, key: number) {
        const color = TransitTypeColorHelper.getColor(link.transitType);
        return (
            <Polyline
                key={key}
                positions={link.positions}
                color={color}
                weight={5}
                opacity={0.8}
            />
        );
    }

    private renderNode() {
        const node = this.props.editNetworkStore!.node;
        if (!node) return null;
        const latLng = L.latLng(node.coordinates.lat, node.coordinates.lon);

        return (
            <NodeMarker
                nodeType={node.type}
                latLng={latLng}
                isDraggable={true}
                node={node}
            />
        );
    }

    render() {
        return (
            <>
                {this.renderLinks()}
                {this.renderNode()}
            </>
        );
    }
}

export default EditNetworkLayer;
