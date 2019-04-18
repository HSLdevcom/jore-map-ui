import React, { Component } from 'react';
import * as L from 'leaflet';
import _ from 'lodash';
import { withLeaflet } from 'react-leaflet';
// import { matchPath } from 'react-router';
import { inject, observer } from 'mobx-react';
import { IReactionDisposer, reaction } from 'mobx';
import EventManager from '~/util/EventManager';
import { LoginStore } from '~/stores/loginStore';
// import navigator from '~/routing/navigator';
// import SubSites from '~/routing/subSites';
import { INode, ILink } from '~/models';
import { LinkStore } from '~/stores/linkStore';
import { MapStore, MapFilter } from '~/stores/mapStore';
import NodeMarker from '../mapIcons/NodeMarker';
import StartMarker from '../mapIcons/StartMarker';
import { LeafletContext } from '../../Map';
import ArrowDecorator from '../ArrowDecorator';

const START_MARKER_COLOR = '#00df0b';

interface IEditLinkLayerProps {
    linkStore?: LinkStore;
    mapStore?: MapStore;
    leaflet: LeafletContext;
    loginStore?: LoginStore;
}

@inject('linkStore', 'mapStore', 'loginStore')
@observer
class EditLinkLayer extends Component<IEditLinkLayerProps> {
    private reactionDisposer: IReactionDisposer;
    private editableLinks: L.Polyline[] = [];

    componentDidMount() {
        this.reactionDisposer = reaction(
            () => this.props.linkStore!.link,
            () => this.props.linkStore!.link === null && this.removeOldLinks(),
        );
        EventManager.on('undo', this.props.linkStore!.undo);
        EventManager.on('redo', this.props.linkStore!.redo);
    }

    componentWillUnmount() {
        this.reactionDisposer();

        const map = this.props.leaflet.map;
        map!.off('editable:vertex:dragend');
        map!.off('editable:vertex:deleted');
        EventManager.off('undo', this.props.linkStore!.undo);
        EventManager.off('redo', this.props.linkStore!.redo);
    }

    private removeOldLinks = () => {
        // Remove (possible) previously drawn links from map
        this.editableLinks.forEach((editableLink) => {
            editableLink.remove();
        });
        this.editableLinks = [];
    }

    private drawEditableLink = () => {
        const link = this.props.linkStore!.link;
        const map = this.props.leaflet.map;
        if (!map) return;

        this.removeOldLinks();
        this.drawEditableLinkToMap(link);

        map.off('editable:vertex:dragend');
        map.on('editable:vertex:dragend', () => {
            this.refreshEditableLink();
        });

        map!.off('editable:vertex:deleted');
        map!.on('editable:vertex:deleted', (data: any) => {
            this.refreshEditableLink();
        });
    }

    private refreshEditableLink() {
        const latlngs = this.editableLinks[0].getLatLngs()[0] as L.LatLng[];
        this.props.linkStore!.updateLinkGeometry(latlngs);
    }

    private drawEditableLinkToMap = (link: ILink) => {
        const map = this.props.leaflet.map;
        if (map) {
            const editableLink = L.polyline(
                [_.cloneDeep(link.geometry)],
                {
                    interactive: false,
                    color: '#000',
                },
            ).addTo(map);

            if (this.props.loginStore!.hasWriteAccess) {
                editableLink.enableEdit();
                const latLngs = editableLink.getLatLngs() as L.LatLng[][];
                const coords = latLngs[0];
                const coordsToDisable = [coords[0], coords[coords.length - 1]];
                coordsToDisable.forEach((coordToDisable: any) => {
                    const vertexMarker = coordToDisable.__vertex;
                    vertexMarker.dragging.disable();
                    vertexMarker._events.click = {};
                    vertexMarker.setOpacity(0);
                    // Put vertex marker z-index low so that it
                    // would be below other layers that needs to be clickable
                    vertexMarker.setZIndexOffset(-1000);
                });

                this.editableLinks.push(editableLink);
            }
        }
    }

    private renderLinkDecorator = () => {
        if (!this.props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)) return null;

        const link = this.props.linkStore!.link;
        return (
            <ArrowDecorator
                color='#000'
                geometry={link!.geometry}
                hideOnEventName='editable:vertex:drag'
                showOnEventName='editable:vertex:dragend'
            />
        );
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
                isSelected={this.props.mapStore!.selectedNodeId === node.id}
                isDraggable={false}
                onClickEventParams={{ nodeId: node.id }}
                node={node}
            />
        );
    }

    private renderStartMarker = () => {
        const startMarkerCoordinates = this.props.linkStore!.startMarkerCoordinates;
        if (!startMarkerCoordinates) return null;

        return (
            <StartMarker
                latLng={startMarkerCoordinates}
                color={START_MARKER_COLOR}
            />
        );
    }

    render() {
        // const isLinkViewVisible = Boolean(matchPath(navigator.getPathName(), SubSites.link));
        // if (!isLinkViewVisible) return this.renderStartMarker();

        const link = this.props.linkStore!.link;
        if (!link || !link.geometry) {
            return null;
        }

        this.drawEditableLink();

        return (
            <>
                {this.renderLinkDecorator()}
                {this.renderNodes()}
                {this.renderStartMarker()}
            </>
        );
    }
}

export default withLeaflet(EditLinkLayer);
