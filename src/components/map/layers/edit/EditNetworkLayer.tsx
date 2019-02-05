import React, { Component } from 'react';
import * as L from 'leaflet';
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

interface IEditNetworkLayerProps {
    editNetworkStore?: EditNetworkStore;
    leaflet: LeafletContext;
}

@inject('editNetworkStore')
@observer
class EditNetworkLayer extends Component<IEditNetworkLayerProps> {
    editableLinks: L.Polyline[] = [];

    private drawEditableLinks() {
        const links = this.props.editNetworkStore!.links;
        const map = this.props.leaflet.map;
        const isLinkView = Boolean(matchPath(navigator.getPathName(), SubSites.link));
        if (!isLinkView || !links || !map) return;

        // Remove (possible) previously drawn links from map
        this.editableLinks.forEach((editableLink) => {
            map.removeLayer(editableLink);
        });
        this.editableLinks = [];

        links.map((link: ILink, index) => this.drawEditableLinkToMap(link, index));

        map.off('editable:vertex:dragend');
        map.on('editable:vertex:dragend', () => {
            const currentLinks = this.props.editNetworkStore!.links.map(link => ({ ...link }));
            const latlngs = this.editableLinks[0].getLatLngs()[0] as L.LatLng[];
            currentLinks[0].geometry = latlngs;
            this.props.editNetworkStore!.setLinks(currentLinks);
        });
    }

    private drawEditableLinkToMap(link: ILink, key: number) {
        const map = this.props.leaflet.map;
        if (map) {
            const editableLink = L.polyline([link.geometry]).addTo(map);
            editableLink.enableEdit();
            const linkLatLngs = [editableLink.getLatLngs()];

            // Hide first and last vertex from editableLink
            linkLatLngs.forEach((_linkLatLng: any) => {
                _linkLatLng.forEach((coords: any) => {
                    const coordsToDisable = [coords[0], coords[coords.length - 1]];
                    coordsToDisable.forEach((coordToDisable: any) => {
                        const vertexMarker = coordToDisable.__vertex;
                        vertexMarker.dragging.disable();
                        vertexMarker.setOpacity(0);
                    });
                });
            });
            this.editableLinks.push(editableLink);
        }
    }

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
                isDraggable={false}
                node={node}
            />
        );
    }

    render() {
        this.drawEditableLinks();
        return (
            <>
                {this.renderLinks()}
                {this.renderNodes()}
            </>
        );
    }
}

export default withLeaflet(EditNetworkLayer);
