import * as L from 'leaflet';
import _ from 'lodash';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { withLeaflet } from 'react-leaflet';
import { matchPath } from 'react-router';
import NodeType from '~/enums/nodeType';
import EventHelper, { INodeClickParams } from '~/helpers/EventHelper';
import { ILink } from '~/models';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import { LoginStore } from '~/stores/loginStore';
import { MapFilter, MapStore } from '~/stores/mapStore';
import { NodeStore } from '~/stores/nodeStore';
import NodeLocationType from '~/types/NodeLocationType';
import NodeUtils from '~/utils/NodeUtils';
import { LeafletContext } from '../../Map';
import NodeMarker from '../markers/NodeMarker';
import ArrowDecorator from '../utils/ArrowDecorator';
import DashedLine from '../utils/DashedLine';

interface IEditNodeLayerProps {
    nodeStore?: NodeStore;
    mapStore?: MapStore;
    loginStore?: LoginStore;
    leaflet: LeafletContext;
}

@inject('mapStore', 'nodeStore', 'loginStore')
@observer
class EditNodeLayer extends Component<IEditNodeLayerProps> {
    private nodeListener: IReactionDisposer;
    private editableLinks: L.Polyline[] = [];

    componentDidMount() {
        this.nodeListener = reaction(
            () => this.props.nodeStore!.node,
            () => this.props.nodeStore!.node === null && this.removeOldLinks()
        );
        EventHelper.on('undo', this.props.nodeStore!.undo);
        EventHelper.on('redo', this.props.nodeStore!.redo);
    }

    componentWillUnmount() {
        this.nodeListener();
        this.removeOldLinks();

        const map = this.props.leaflet.map;
        map!.off('editable:vertex:dragend');
        map!.off('editable:vertex:deleted');
        EventHelper.off('undo', this.props.nodeStore!.undo);
        EventHelper.off('redo', this.props.nodeStore!.redo);
    }

    private removeOldLinks = () => {
        // Remove (possible) previously drawn links from map
        this.editableLinks.forEach((editableLink: any) => {
            editableLink.remove();
        });
        this.editableLinks = [];
    };

    private renderNodes() {
        const node = this.props.nodeStore!.node;
        return (
            <>
                {this.renderNode({
                    coordinates: node.coordinates,
                    nodeLocationType: 'coordinates'
                })}
                {node.type === NodeType.STOP &&
                    this.renderNode({
                        coordinates: node.coordinatesProjection,
                        nodeLocationType: 'coordinatesProjection'
                    })}
            </>
        );
    }

    private renderNode = ({
        coordinates,
        nodeLocationType
    }: {
        coordinates: L.LatLng;
        nodeLocationType: NodeLocationType;
    }) => {
        const node = this.props.nodeStore!.node;

        const isNewNodeView = Boolean(matchPath(navigator.getPathName(), SubSites.newNode));
        const onNodeClick = () => {
            const clickParams: INodeClickParams = { node };
            EventHelper.trigger('nodeClick', clickParams);
        };
        return (
            <NodeMarker
                key={`${node.id}-${nodeLocationType}`}
                coordinates={coordinates}
                nodeType={node.type}
                nodeLocationType={nodeLocationType}
                nodeId={node.id}
                shortId={NodeUtils.getShortId(node)}
                hastusId={node.stop ? node.stop.hastusId : undefined}
                isDraggable={this.props.loginStore!.hasWriteAccess}
                isSelected={isNewNodeView || this.props.mapStore!.selectedNodeId === node.id}
                onClick={onNodeClick}
                onMoveMarker={this.onMoveMarker(nodeLocationType)}
            />
        );
    };

    private onMoveMarker = (nodeLocationType: NodeLocationType) => (coordinates: L.LatLng) => {
        this.props.nodeStore!.updateNodeGeometry(nodeLocationType, coordinates);
    };

    private drawEditableLinks = () => {
        this.removeOldLinks();

        this.props.nodeStore!.links.forEach(link => this.drawEditableLink(link));

        const map = this.props.leaflet.map;

        map!.on('editable:vertex:dragend', (data: any) => {
            this.updateLinkGeometry(data.layer._leaflet_id);
        });
        map!.on('editable:vertex:deleted', (data: any) => {
            this.updateLinkGeometry(data.layer._leaflet_id);
        });
    };

    private updateLinkGeometry(leafletId: number) {
        const editableLink = this.editableLinks.find((link: any) => link._leaflet_id === leafletId);
        if (editableLink) {
            const latlngs = editableLink!.getLatLngs()[0] as L.LatLng[];
            const editableLinkIndex = this.editableLinks.findIndex(
                (link: any) => link._leaflet_id === leafletId
            );
            this.props.nodeStore!.updateLinkGeometry(latlngs, editableLinkIndex);
        }
    }

    private drawEditableLink = (link: ILink) => {
        const isNodeView = Boolean(matchPath(navigator.getPathName(), SubSites.node));
        if (!isNodeView || !link) return;

        this.drawEditableLinkToMap(link);
    };

    private drawEditableLinkToMap = (link: ILink) => {
        const map = this.props.leaflet.map;
        if (map) {
            const editableLink = L.polyline([_.cloneDeep(link.geometry)], {
                interactive: false,
                color: '#000'
            }).addTo(map);

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
    };

    private renderLinkDecorators = () => {
        if (!this.props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)) {
            return null;
        }

        return this.props.nodeStore!.links.map((link, index) => (
            <ArrowDecorator
                key={index}
                color='#000'
                geometry={link!.geometry}
                hideOnEventName='editable:vertex:drag'
                showOnEventName='editable:vertex:dragend'
            />
        ));
    };

    private renderDashedLine = (link: ILink, index: number) => {
        const node = this.props.nodeStore!.node;
        if (link.startNode.id === node.id) {
            return (
                <DashedLine
                    key={`${index}-startNodeDashedLine`}
                    startPoint={link.geometry[link.geometry.length - 1]}
                    endPoint={link.endNode.coordinates}
                    color={'#efc210'}
                />
            );
        }
        return (
            <DashedLine
                key={`${index}-endNodeDashedLine`}
                startPoint={link.geometry[0]}
                endPoint={link.startNode.coordinates}
                color={'#efc210'}
            />
        );
    };

    render() {
        if (!this.props.nodeStore!.node) return null;

        const isNodeViewVisible = Boolean(matchPath(navigator.getPathName(), SubSites.node));
        if (!isNodeViewVisible) return null;

        this.drawEditableLinks();
        return (
            <>
                {this.renderNodes()}
                {this.renderLinkDecorators()}
                {this.props.nodeStore!.links.map((link, index: number) => {
                    return this.renderDashedLine(link, index);
                })}
            </>
        );
    }
}

export default withLeaflet(EditNodeLayer);
