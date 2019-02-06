import React, { Component } from 'react';
import * as L from 'leaflet';
import { withLeaflet } from 'react-leaflet';
import { matchPath } from 'react-router';
import { inject, observer } from 'mobx-react';
import { IReactionDisposer, reaction } from 'mobx';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import { INode, ILink } from '~/models';
import { LinkStore } from '~/stores/linkStore';
import NodeMarker from '../mapIcons/NodeMarker';
import { LeafletContext } from '../../Map';

interface IEditLinkLayerProps {
    linkStore?: LinkStore;
    leaflet: LeafletContext;
}

@inject('linkStore')
@observer
class EditLinkLayer extends Component<IEditLinkLayerProps> {
    private reactionDisposer: IReactionDisposer;
    private editableLinks: L.Polyline[] = [];

    componentDidMount() {
        this.reactionDisposer = reaction(
            () => this.props.linkStore!.link,
            () => this.props.linkStore!.link === undefined && this.removeOldLinks(),
        );
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
        this.reactionDisposer();
    }

    private drawEditableLink = () => {
        const link = this.props.linkStore!.link;
        const map = this.props.leaflet.map;
        const isLinkView = Boolean(matchPath(navigator.getPathName(), SubSites.link));
        if (!isLinkView || !link || !map) return;

        this.removeOldLinks();
        this.drawEditableLinkToMap(link);

        map.off('editable:vertex:dragend');
        map.on('editable:vertex:dragend', () => {
            const linkCopy = Object.assign({}, this.props.linkStore!.link);
            const latlngs = this.editableLinks[0].getLatLngs()[0] as L.LatLng[];
            linkCopy.geometry = latlngs;
            this.props.linkStore!.setLink(linkCopy);
        });
    }

    private drawEditableLinkToMap = (link: ILink) => {
        const map = this.props.leaflet.map;
        if (map) {
            const editableLink = L.polyline([link.geometry]).addTo(map);
            editableLink.enableEdit();
            const latLngs = editableLink.getLatLngs() as L.LatLng[][];
            const coords = latLngs[0];
            const coordsToDisable = [coords[0], coords[coords.length - 1]];
            coordsToDisable.forEach((coordToDisable: any) => {
                const vertexMarker = coordToDisable.__vertex;
                vertexMarker.dragging.disable();
                vertexMarker.setOpacity(0);
            });

            this.editableLinks.push(editableLink);
        }
    }

    private renderNodes = () => {
        const nodes = this.props.linkStore!.nodes;
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

        this.drawEditableLink();

        return (
            this.renderNodes()
        );
    }
}

export default withLeaflet(EditLinkLayer);
