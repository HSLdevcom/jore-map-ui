import * as L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import { withLeaflet, Marker as LeafletMarker } from 'react-leaflet';
import EventHelper, { INodeClickParams } from '~/helpers/EventHelper';
import { ILink, INode } from '~/models';
import { LinkStore } from '~/stores/linkStore';
import { LoginStore } from '~/stores/loginStore';
import { MapFilter, MapStore } from '~/stores/mapStore';
import NodeUtils from '~/utils/NodeUtils';
import LeafletUtils from '~/utils/leafletUtils';
import { LeafletContext } from '../../Map';
import Marker from '../markers/Marker';
import NodeMarker from '../markers/NodeMarker';
import ArrowDecorator from '../utils/ArrowDecorator';
import DashedLine from '../utils/DashedLine';
import * as s from './editLinkLayer.scss';

const START_MARKER_COLOR = '#00df0b';

type IEditLinkLayerProps = {
    linkStore?: LinkStore;
    mapStore?: MapStore;
    leaflet: LeafletContext;
    loginStore?: LoginStore;
};
const EditLinkLayer = inject(
    'linkStore',
    'mapStore',
    'loginStore'
)(
    observer((props: IEditLinkLayerProps) => {
        const [editableLinks, setEditableLinks] = useState<L.Polyline[]>([]);

        useEffect(() => {
            editableLinks.forEach((editableLink) => {
                editableLink.remove();
            });
            drawEditableLink();
        }, [props.linkStore!.link?.geometry]);

        const updateLinkGeometry = useCallback(() => {
            const latLngs = editableLinks[0].getLatLngs()[0] as L.LatLng[];
            props.linkStore!.updateLinkGeometry(latLngs);
        }, [editableLinks]);

        useEffect(() => {
            const map = props.leaflet.map;
            if (!map) return;
            map.on('editable:vertex:dragend', () => {
                updateLinkGeometry();
            });
            map.on('editable:vertex:deleted', () => {
                updateLinkGeometry();
            });
            EventHelper.on('undo', props.linkStore!.undo);
            EventHelper.on('redo', props.linkStore!.redo);
            return () => {
                map.off('editable:vertex:dragend');
                map.off('editable:vertex:deleted');
                EventHelper.off('undo', props.linkStore!.undo);
                EventHelper.off('redo', props.linkStore!.redo);
            };
        }, [updateLinkGeometry, props.leaflet.map]);

        const drawEditableLink = () => {
            const link = props.linkStore!.link;
            const map = props.leaflet.map;
            if (!map || !link || !link.geometry) return;

            const isEditable =
                props.loginStore!.hasWriteAccess && props.linkStore!.isLinkGeometryEditable;
            drawLinkToMap(link, isEditable);
        };

        const drawLinkToMap = (link: ILink, isEditable: boolean) => {
            const map = props.leaflet.map;
            if (map) {
                const editableLink = L.polyline([_.cloneDeep(link.geometry)], {
                    interactive: false,
                    color: '#000',
                }).addTo(map);

                if (isEditable) {
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
                    setEditableLinks([editableLink]);
                }
            }
        };

        const renderLinkDecorator = () => {
            if (!props.mapStore!.isMapFilterEnabled(MapFilter.arrowDecorator)) {
                return null;
            }
            const link = props.linkStore!.link;
            return (
                <ArrowDecorator
                    color='#000'
                    geometry={link!.geometry}
                    hideOnEventName='editable:vertex:drag'
                    showOnEventName='editable:vertex:dragend'
                />
            );
        };

        const renderNodes = useCallback(() => {
            const nodes = props.linkStore!.nodes;
            return nodes.map((n, index) => <Node node={n} key={index} />);
        }, [props.linkStore!.nodes]);

        const Node = React.memo(({ node }: { node: INode }) => {
            if (!node) return null;
            const onNodeClick = () => {
                const clickParams: INodeClickParams = { nodeId: node.id };
                EventHelper.trigger('nodeClick', clickParams);
            };

            return (
                <NodeMarker
                    key={node.id}
                    coordinates={node.coordinates}
                    nodeType={node.type}
                    transitTypes={node.transitTypes ? node.transitTypes : []}
                    nodeLocationType={'coordinates'}
                    nodeId={node.id}
                    shortId={NodeUtils.getShortId(node)}
                    hastusId={node.stop ? node.stop.hastusId : undefined}
                    isHighlighted={props.mapStore!.selectedNodeId === node.id}
                    isDraggable={false}
                    onClick={onNodeClick}
                />
            );
        });

        const renderDashedLines = () => {
            const link = props.linkStore!.link;
            return [
                <DashedLine
                    key={'startNodeDashedLine'}
                    startPoint={link.geometry[0]}
                    endPoint={link.startNode.coordinates}
                />,
                <DashedLine
                    key={'endNodeDashedLine'}
                    startPoint={link.geometry[link.geometry.length - 1]}
                    endPoint={link.endNode.coordinates}
                />,
            ];
        };
        const renderLinkPointLabel = (latLng: L.LatLng) => {
            return LeafletUtils.createDivIcon({
                html: (
                    <div className={s.linkPointLabel}>
                        {latLng.lat}, {latLng.lng}
                    </div>
                ),
                options: { classNames: [] },
            });
        };

        const renderLinkPointCoordinates = () => {
            if (!props.mapStore!.isMapFilterEnabled(MapFilter.linkPoint)) {
                return null;
            }
            const link = props.linkStore!.link;
            return link.geometry.map((latLng, index: number) => {
                return (
                    <LeafletMarker
                        key={`linkPoint-${index}`}
                        position={latLng}
                        icon={renderLinkPointLabel(latLng)}
                    />
                );
            });
        };

        const renderStartMarker = () => {
            const startMarkerCoordinates = props.linkStore!.startMarkerCoordinates;
            if (!startMarkerCoordinates) return null;

            return <Marker latLng={startMarkerCoordinates} color={START_MARKER_COLOR} />;
        };

        const link = props.linkStore!.link;
        if (!link || !link.geometry) {
            return <>{renderStartMarker()}</>;
        }

        return (
            <>
                {renderLinkDecorator()}
                {renderNodes()}
                {renderStartMarker()}
                {renderDashedLines()}
                {renderLinkPointCoordinates()}
            </>
        );
    })
);

export default withLeaflet(EditLinkLayer);
