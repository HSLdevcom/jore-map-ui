import * as L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withLeaflet } from 'react-leaflet';
import { matchPath } from 'react-router';
import NodeType from '~/enums/nodeType';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventListener, { INodeClickParams } from '~/helpers/EventListener';
import { ILink } from '~/models';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import { LoginStore } from '~/stores/loginStore';
import { MapFilter, MapStore } from '~/stores/mapStore';
import { NetworkStore } from '~/stores/networkStore';
import { NodeStore } from '~/stores/nodeStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import NodeLocationType from '~/types/NodeLocationType';
import NodeUtils from '~/utils/NodeUtils';
import { isNetworkElementOld } from '~/utils/networkUtils';
import { LeafletContext } from '../../Map';
import NodeMarker from '../markers/NodeMarker';
import ArrowDecorator from '../utils/ArrowDecorator';
import DashedLine from '../utils/DashedLine';

const OLD_LINK_COLOR = '#8c8c8c';
const ACTIVE_LINK_COLOR = '#000';

interface IEditNodeLayerProps {
    leaflet: LeafletContext;
    nodeStore?: NodeStore;
    mapStore?: MapStore;
    loginStore?: LoginStore;
    toolbarStore?: ToolbarStore;
    networkStore?: NetworkStore;
}

const EditNodeLayer = inject(
    'mapStore',
    'nodeStore',
    'loginStore',
    'toolbarStore',
    'networkStore'
)(
    observer((props: IEditNodeLayerProps) => {
        const [editableLinks, setEditableLinks] = useState<L.Polyline[]>([]);
        const enableSelectNetworkEntityToolTimeout = useRef<number>();

        useEffect(() => {
            editableLinks.forEach((editableLink) => {
                editableLink.remove();
            });
            drawEditableLinks();
        }, [props.nodeStore!.links, props.networkStore!.selectedDate]);

        const updateLinkGeometry = useCallback(
            (leafletId: number) => {
                const editableLink = editableLinks.find(
                    (link: any) => link._leaflet_id === leafletId
                );
                if (editableLink) {
                    const latlngs = editableLink!.getLatLngs()[0] as L.LatLng[];
                    const editableLinkIndex = editableLinks.findIndex(
                        (link: any) => link._leaflet_id === leafletId
                    );
                    props.nodeStore!.updateLinkGeometry(latlngs, editableLinkIndex);
                }
            },
            [editableLinks]
        );

        useEffect(() => {
            const map = props.leaflet.map;
            if (!map) return;
            map.on('editable:vertex:dragend', (data: any) => {
                updateLinkGeometry(data.layer._leaflet_id);

                // Disable SelectNetworkEntity tool for a while so that a entity selection box wouldnt appear on screen
                if (props.toolbarStore!.isSelected(ToolbarToolType.SelectNetworkEntity)) {
                    props.toolbarStore!.selectedTool!.deactivate();

                    if (enableSelectNetworkEntityToolTimeout.current) {
                        clearTimeout(enableSelectNetworkEntityToolTimeout.current);
                    }
                    enableSelectNetworkEntityToolTimeout.current = window.setTimeout(() => {
                        props.toolbarStore!.selectedTool!.activate();
                    }, 500);
                }
            });
            map.on('editable:vertex:deleted', (data: any) => {
                updateLinkGeometry(data.layer._leaflet_id);
            });
            EventListener.on('undo', props.nodeStore!.undo);
            EventListener.on('redo', props.nodeStore!.redo);
            return () => {
                map.off('editable:vertex:dragend');
                map.off('editable:vertex:deleted');
                EventListener.off('undo', props.nodeStore!.undo);
                EventListener.off('redo', props.nodeStore!.redo);
            };
        }, [updateLinkGeometry, props.leaflet.map]);

        const renderNodes = () => {
            const node = props.nodeStore!.node;
            return (
                <>
                    {renderNode({
                        coordinates: node.coordinatesProjection,
                        nodeLocationType: 'coordinatesProjection',
                    })}
                    {node.type === NodeType.STOP &&
                        renderNode({
                            coordinates: node.coordinates,
                            nodeLocationType: 'coordinates',
                        })}
                    <DashedLine
                        startPoint={node.coordinates}
                        endPoint={node.coordinatesProjection}
                    />
                </>
            );
        };

        const renderNode = ({
            coordinates,
            nodeLocationType,
        }: {
            coordinates: L.LatLng;
            nodeLocationType: NodeLocationType;
        }) => {
            const node = props.nodeStore!.node;

            const onNodeClick = () => {
                const clickParams: INodeClickParams = { nodeId: node.id };
                EventListener.trigger('nodeClick', clickParams);
            };
            return (
                <NodeMarker
                    key={`${node.id}-${nodeLocationType}`}
                    coordinates={coordinates}
                    nodeType={node.type}
                    transitTypes={node.transitTypes ? node.transitTypes : []}
                    visibleNodeLabels={props.mapStore!.visibleNodeLabels}
                    nodeLocationType={nodeLocationType}
                    nodeId={nodeLocationType === 'coordinates' ? node.id : undefined}
                    shortId={
                        nodeLocationType === 'coordinates' ? NodeUtils.getShortId(node) : undefined
                    }
                    hastusId={
                        nodeLocationType === 'coordinates' && node.stop
                            ? node.stop.hastusId
                            : undefined
                    }
                    isDraggable={props.loginStore!.hasWriteAccess}
                    isDisabled={false}
                    radius={
                        node.stop && nodeLocationType === 'coordinates'
                            ? node.stop.radius
                            : undefined
                    }
                    onClick={onNodeClick}
                    onMoveMarker={onMoveMarker(nodeLocationType)}
                />
            );
        };

        const onMoveMarker = (nodeLocationType: NodeLocationType) => (coordinates: L.LatLng) => {
            props.nodeStore!.updateNodeGeometry(nodeLocationType, coordinates);
        };

        const drawEditableLinks = () => {
            const tempEditableLinks: L.Polyline[] = [];
            props.nodeStore!.links.forEach((link) => {
                const isNodeView = Boolean(matchPath(navigator.getPathName(), SubSites.node));
                if (isNodeView && link) {
                    const editableLink = drawEditableLink(link);
                    if (editableLink) {
                        tempEditableLinks.push(editableLink);
                    }
                }
            });
            setEditableLinks(tempEditableLinks);

            const map = props.leaflet.map;
            map!.on('editable:vertex:dragend', (data: any) => {
                updateLinkGeometry(data.layer._leaflet_id);
            });
            map!.on('editable:vertex:deleted', (data: any) => {
                updateLinkGeometry(data.layer._leaflet_id);
            });
        };

        const drawEditableLink = (link: ILink) => {
            const map = props.leaflet.map;
            if (map) {
                const isLinkOld = isNetworkElementOld(link.dateRanges);
                const editableLink = L.polyline([_.cloneDeep(link.geometry)], {
                    interactive: false,
                    color: isLinkOld ? OLD_LINK_COLOR : ACTIVE_LINK_COLOR,
                }).addTo(map);

                if (props.loginStore!.hasWriteAccess) {
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
                    return editableLink;
                }
            }
            return null;
        };

        const renderLinkDecorators = () => {
            if (!props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)) {
                return null;
            }

            return props.nodeStore!.links.map((link, index) => {
                const isLinkOld = isNetworkElementOld(link.dateRanges);
                return (
                    <ArrowDecorator
                        key={index}
                        color={isLinkOld ? OLD_LINK_COLOR : ACTIVE_LINK_COLOR}
                        geometry={link!.geometry}
                        hideOnEventName='editable:vertex:drag'
                        showOnEventName='editable:vertex:dragend'
                    />
                );
            });
        };

        const renderDashedLine = (link: ILink, index: number) => {
            const node = props.nodeStore!.node;
            if (link.startNode.id === node.id) {
                return (
                    <DashedLine
                        key={`${index}-startNodeDashedLine`}
                        startPoint={link.geometry[link.geometry.length - 1]}
                        endPoint={link.endNode.coordinates}
                    />
                );
            }
            return (
                <DashedLine
                    key={`${index}-endNodeDashedLine`}
                    startPoint={link.geometry[0]}
                    endPoint={link.startNode.coordinates}
                />
            );
        };

        if (!props.nodeStore!.node) return null;

        const isNodeViewVisible = Boolean(matchPath(navigator.getPathName(), SubSites.node));
        if (!isNodeViewVisible) return null;

        return (
            <>
                {renderNodes()}
                {renderLinkDecorators()}
                {props.nodeStore!.links.map((link, index: number) => {
                    return renderDashedLine(link, index);
                })}
            </>
        );
    })
);

export default withLeaflet(EditNodeLayer);
