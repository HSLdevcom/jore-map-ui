import React, { Component } from 'react';
import { Polyline, withLeaflet } from 'react-leaflet';
import { matchPath } from 'react-router';
import { inject, observer } from 'mobx-react';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import { INode, ILink } from '~/models';
import { EditNetworkStore } from '~/stores/editNetworkStore';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import NodeMarker from '../mapIcons/NodeMarker';
import { LeafletContext } from '../../Map';

interface IEditNodeLayerProps {
    editNetworkStore?: EditNetworkStore;
    leaflet: LeafletContext;
}

@inject('editNetworkStore')
@observer
class EditNodeLayer extends Component<IEditNodeLayerProps> {

    private renderLinks() {
        const links = this.props.editNetworkStore!.links;
        const isLinkView = Boolean(matchPath(navigator.getPathName(), SubSites.link));

        if (isLinkView || !links) return null;
        return links.map((link: ILink, index) => this.renderLink(link, index));
    }

    private renderLink(link: ILink, key: number) {
        const color = TransitTypeColorHelper.getColor(link.transitType);
        return (
            <Polyline
                key={key}
                positions={link.geometry}
                color={color}
                weight={5}
                opacity={0.8}
            />
        );
    }

    private renderNodes() {
        const nodes = this.props.editNetworkStore!.nodes;
        return nodes.map(n => this.renderNode(n));
    }

    private renderNode(node: INode) {
        if (!node) return null;

        return (
            <NodeMarker
                key={node.id}
                isDraggable={true}
                node={node}
            />
        );
    }

    render() {
        const isNodeViewVisible = Boolean(matchPath(navigator.getPathName(), SubSites.networkNode));
        if (!isNodeViewVisible) return null;

        return (
            <>
                {this.renderLinks()}
                {this.renderNodes()}
            </>
        );
    }
}

export default withLeaflet(EditNodeLayer);
