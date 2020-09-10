import {
    featureCollection,
    point,
    polygon,
    Feature,
    FeatureCollection,
    Point,
    Properties,
} from '@turf/helpers';
import pointsWithinPolygon from '@turf/points-within-polygon';
import L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
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
        const getMap = (): L.Map => {
            return props.map.current.leafletElement;
        };
        const [turfPointNodeFeatures, setTurfPointNodeFeatures] = useState<FeatureCollection<
            Point,
            Properties
        > | null>(null);
        const [renderCount, updateRenderCount] = React.useState(1);

        useEffect(() => {
            const nodeFeatures = props.searchResultStore!.allNodes.map((node: ISearchNode) => {
                return point([node.coordinates.lat, node.coordinates.lng], node);
            });
            const turfPointNodeFeatures: FeatureCollection<Point, Properties> = featureCollection(
                nodeFeatures
            );
            setTurfPointNodeFeatures(turfPointNodeFeatures);
        }, [
            props.networkStore!.selectedTransitTypes.length === 0 && !turfPointNodeFeatures,
            props.searchResultStore!.allNodes.length,
        ]);

        const forceUpdate = () => {
            updateRenderCount(renderCount + 1);
        };
        useEffect(() => {
            getMap().on('moveend', forceUpdate);
            return () => {
                getMap().off('moveend', forceUpdate);
            };
        });

        if (props.mapStore!.areNetworkLayersHidden) return <div />;
        if (!turfPointNodeFeatures) return <div />;

        const bounds = getMap().getBounds();

        const ne = bounds.getNorthEast();
        const se = bounds.getSouthEast();
        const sw = bounds.getSouthWest();
        const nw = bounds.getNorthWest();

        const searchWithin = polygon([
            [
                [ne.lat, ne.lng],
                [se.lat, se.lng],
                [sw.lat, sw.lng],
                [nw.lat, nw.lng],
                [ne.lat, ne.lng],
            ],
        ]);

        const featuresToShow = pointsWithinPolygon(turfPointNodeFeatures, searchWithin)
            .features.map((nodeFeature: Feature<Point, Properties>) => {
                return nodeFeature.properties as ISearchNode;
            })
            .filter((node: ISearchNode) => {
                return !isNetworkNodeHidden({
                    nodeId: node.id,
                    transitTypeCodes: node.transitTypes.join(','),
                    dateRangesString: node.dateRanges,
                });
            });

        return (
            <>
                {featuresToShow.map((node: ISearchNode, index: number) => {
                    return (
                        <NodeMarker
                            key={`nodeMarker-${node.id}`}
                            coordinates={node.coordinates}
                            nodeType={node.type}
                            transitTypes={node.transitTypes}
                            visibleNodeLabels={props.mapStore!.visibleNodeLabels}
                            nodeLocationType={'coordinates'}
                            nodeId={node.id}
                            onClick={props.onClick}
                            onContextMenu={props.onContextMenu}
                            size={props.networkStore!.nodeSize}
                        />
                    );
                })}
            </>
        );
    })
);

export default NodeLayer;
