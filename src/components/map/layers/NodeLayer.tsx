import { LatLngBounds } from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import NodeType from '~/enums/nodeType';
import { ISearchNode } from '~/models/INode';
import { MapStore } from '~/stores/mapStore';
import { NetworkStore } from '~/stores/networkStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { SearchResultStore } from '~/stores/searchResultStore';
import { isNetworkNodeHidden } from '~/utils/networkUtils';
import ClusterNodeMarker from './markers/ClusterNodeMarker';
import NodeMarker from './markers/NodeMarker';

interface INodeLayerProps {
    map: any;
    onClick: Function;
    onContextMenu: Function;
    searchResultStore?: SearchResultStore;
    mapStore?: MapStore;
    networkStore?: NetworkStore;
    routePathStore?: RoutePathStore;
}

const NodeLayer = inject(
    'searchResultStore',
    'mapStore',
    'networkStore',
    'routePathStore'
)(
    observer((props: INodeLayerProps) => {
        const getMap = (): L.Map | undefined => {
            return props.map.current?.leafletElement;
        };
        const [renderCount, updateRenderCount] = useState<number>(1);
        const forceUpdate = () => {
            updateRenderCount(renderCount + 1);
        };
        useEffect(() => {
            getMap()!.on('moveend', forceUpdate);
            return () => {
                const map = getMap();
                if (map) {
                    map.off('moveend', forceUpdate);
                }
            };
        });
        const mapBounds = getMap()!.getBounds();
        const allNodes = props.searchResultStore!.allNodes;
        const nodesInMapBounds = useMemo(() => {
            if (!mapBounds) {
                return [];
            }
            return allNodes
                .filter((node) => mapBounds.contains([node.coordinates.lat, node.coordinates.lng]))
                .filter((node: ISearchNode) => {
                    return !isNetworkNodeHidden({
                        nodeId: node.id,
                        transitTypeCodes: node.transitTypes.join(','),
                        dateRangesString: node.dateRanges,
                    });
                });
        }, [allNodes, mapBounds, props.networkStore!.selectedTransitTypes]);

        if (props.mapStore!.areNetworkLayersHidden) return <div />;
        if (!nodesInMapBounds) return <div />;

        const renderNodeMarker = (node: ISearchNode) => {
            const coordinates =
                node.type === NodeType.STOP ? node.coordinates : node.coordinatesProjection;
            return (
                <NodeMarker
                    key={`nodeMarker-${node.id}`}
                    coordinates={coordinates}
                    nodeType={node.type}
                    transitTypes={node.transitTypes}
                    visibleNodeLabels={props.mapStore!.visibleNodeLabels}
                    nodeLocationType={'coordinates'}
                    nodeId={node.id}
                    shortId={
                        node.type === NodeType.STOP && node.shortIdString
                            ? `${node.shortIdLetter ? node.shortIdLetter : ''}${node.shortIdString}`
                            : undefined
                    }
                    onClick={props.onClick}
                    onContextMenu={props.onContextMenu}
                    size={props.networkStore!.nodeSize}
                ></NodeMarker>
            );
        };

        // Clustered markers are generated only when zoom is > 15. Reason: at lower zoom levels we want as high performance as possible
        if (props.mapStore!.zoom > 15) {
            const nodeAreasMap: Map<LatLngBounds, ISearchNode[]> = _getNodeAreasMap(
                nodesInMapBounds
            );
            const nodeAreasMapEntries = Array.from(nodeAreasMap.entries());
            return (
                <>
                    {nodeAreasMapEntries.map(([bounds, nodeCluster], index) => {
                        if (nodeCluster.length === 1) {
                            return renderNodeMarker(nodeCluster[0]);
                        }
                        if (nodeCluster.length > 1) {
                            return (
                                <ClusterNodeMarker
                                    key={`clusterMarker-${index}`}
                                    coordinates={bounds.getCenter()}
                                    nodes={nodeCluster}
                                    onLeftClickMarkerItem={() => void 0}
                                    onRightClickMarkerItem={() => void 0}
                                />
                            );
                        }
                        return null;
                    })}
                </>
            );
        }

        return (
            <>
                {nodesInMapBounds.map((node: ISearchNode, index: number) => {
                    return renderNodeMarker(node);
                })}
            </>
        );
    })
);

const _getNodeAreasMap = (nodesInMapBounds: ISearchNode[]): Map<LatLngBounds, ISearchNode[]> => {
    if (nodesInMapBounds.length === 0) {
        return new Map();
    }
    const nodeAreasMap = new Map<LatLngBounds, ISearchNode[]>();

    for (const node of nodesInMapBounds) {
        let areaBounds;
        if (nodeAreasMap.size !== 0) {
            const areaEntries = nodeAreasMap.entries();

            for (const [area] of areaEntries) {
                if (area.contains(node.coordinates)) {
                    areaBounds = area;
                    break;
                }
            }
        }

        if (!areaBounds) {
            areaBounds = node.coordinates.toBounds(3);
        }

        const nodeGroup = nodeAreasMap.get(areaBounds) || [];
        nodeGroup.push(node);
        nodeAreasMap.set(areaBounds, nodeGroup);
    }
    return nodeAreasMap;
};

export default NodeLayer;
