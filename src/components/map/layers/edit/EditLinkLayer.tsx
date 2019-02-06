import React, { Component } from 'react';
import * as L from 'leaflet';
import { withLeaflet } from 'react-leaflet';
import { matchPath } from 'react-router';
import { inject, observer } from 'mobx-react';
import { IReactionDisposer, reaction } from 'mobx';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import { INode, ILink } from '~/models';
import { EditNetworkStore } from '~/stores/editNetworkStore';
import NodeMarker from '../mapIcons/NodeMarker';
import { LeafletContext } from '../../Map';

interface IEditLinkLayerProps {
    editNetworkStore?: EditNetworkStore;
    leaflet: LeafletContext;
}

@inject('editNetworkStore')
@observer
class EditLinkLayer extends Component<IEditLinkLayerProps> {
    private reactionDisposers: IReactionDisposer[] = [];
    private editableLinks: L.Polyline[] = [];

    componentDidMount() {
        this.reactionDisposers.push(reaction(
            () => this.props.editNetworkStore!.links,
            () => {
                const links = this.props.editNetworkStore!.links;
                if (links.length === 0) {
                    this.removeOldLinks();
                }
            },
        ));
    }

    private removeOldLinks = () => {
        const map = this.props.leaflet.map;
        // Remove (possible) previously drawn links from map
        this.editableLinks.forEach((editableLink) => {
            map!.removeLayer(editableLink);
        });
        this.editableLinks = [];
    }

    componentWillUnmount() {
        this.reactionDisposers.forEach(r => r());
    }

    private drawEditableLinks = () => {
        const links = this.props.editNetworkStore!.links;
        const map = this.props.leaflet.map;
        const isLinkView = Boolean(matchPath(navigator.getPathName(), SubSites.link));
        if (!isLinkView || !links || !map) return;

        this.removeOldLinks();
        links.map((link: ILink, index) => this.drawEditableLinkToMap(link, index));

        map.off('editable:vertex:dragend');
        map.on('editable:vertex:dragend', () => {
            const currentLinks = this.props.editNetworkStore!.links.map(link => ({ ...link }));
            const latlngs = this.editableLinks[0].getLatLngs()[0] as L.LatLng[];
            currentLinks[0].geometry = latlngs;
            this.props.editNetworkStore!.setLinks(currentLinks);
        });
    }

    private drawEditableLinkToMap = (link: ILink, key: number) => {
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

    private renderNodes = () => {
        const nodes = this.props.editNetworkStore!.nodes;
        return nodes.map(n => this.renderNode(n));
    }

    private renderNode = (node: INode) => {
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
        const isLinkViewVisible = Boolean(matchPath(navigator.getPathName(), SubSites.link));
        if (!isLinkViewVisible) return null;

        this.drawEditableLinks();

        return (
            this.renderNodes()
        );
    }
}

export default withLeaflet(EditLinkLayer);
