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
        useEffect(() => {
            forceUpdate();
        }, [props.networkStore!.selectedTransitTypes, props.searchResultStore!.allNodes])
        const mapBounds = getMap()!.getBounds();
        const allNodes = props.searchResultStore!.allNodes;
        const nodesInMapBounds = useMemo(() => {
            if (!mapBounds) {
              return [];
            }
            return allNodes.filter(
              (node) => mapBounds.contains([node.coordinates.lat, node.coordinates.lng])
            ).filter((node: ISearchNode) => {
                return !isNetworkNodeHidden({
                    nodeId: node.id,
                    transitTypeCodes: node.transitTypes.join(','),
                    dateRangesString: node.dateRanges,
                });
            });
          }, [allNodes, mapBounds]);

        if (props.mapStore!.areNetworkLayersHidden) return <div />;
        if (!nodesInMapBounds) return <div />;
        return (
            <>
                {nodesInMapBounds.map((node: ISearchNode, index: number) => {
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
                                    ? `${node.shortIdLetter ? node.shortIdLetter : ''}${
                                          node.shortIdString
                                      }`
                                    : undefined
                            }
                            onClick={props.onClick}
                            onContextMenu={props.onContextMenu}
                            size={props.networkStore!.nodeSize}
                        ></NodeMarker>
                    );
                })}
            </>
        );
    })
);

export default NodeLayer;
