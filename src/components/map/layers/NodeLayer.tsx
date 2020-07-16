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
import _ from 'lodash';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import EventHelper from '~/helpers/EventHelper';
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

interface INodeLayerState {
    turfPointNodeFeatures: FeatureCollection<Point, Properties> | null;
}

@inject('searchResultStore', 'mapStore', 'networkStore', 'routePathStore')
@observer
class NodeLayer extends React.Component<INodeLayerProps, INodeLayerState> {
    private map: L.Map;
    private mounted: boolean;

    constructor(props: INodeLayerProps) {
        super(props);
        this.state = {
            turfPointNodeFeatures: null,
        };
        this.map = this.props.map.current.leafletElement;
        // Render always when map moves
        this.map.on('moveend', this.redrawNodeLayer);

        reaction(
            () =>
                this.props.routePathStore!.routePath &&
                this.props.routePathStore!.routePath.routePathLinks.length,
            () => this.redrawNodeLayer()
        );
    }

    componentWillUpdate(props: INodeLayerProps) {
        if (this.shouldUpdateNodeFeatures()) {
            this.updateNodeFeatures();
        }
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
        this.map.off('moveend', this.redrawNodeLayer);
    }

    private redrawNodeLayer = () => {
        if (this.mounted) {
            this.forceUpdate();
        }
    };

    private shouldUpdateNodeFeatures = () => {
        if (
            this.props.networkStore!.selectedTransitTypes.length === 0 &&
            !this.state.turfPointNodeFeatures
        ) {
            return false;
        }
        return !this.state.turfPointNodeFeatures;
    };

    private updateNodeFeatures = () => {
        const nodeFeatures = this.props.searchResultStore!.allNodes.map((node: ISearchNode) => {
            return point([node.coordinates.lat, node.coordinates.lng], node);
        });
        const turfPointNodeFeatures: FeatureCollection<Point, Properties> = featureCollection(
            nodeFeatures
        );

        this.setState({
            turfPointNodeFeatures,
        });
    };

    private handleOnLeftClick = (nodeId: string) => (e: L.LeafletEvent) => {
        EventHelper.trigger('mapClick', e);
        this.props.onClick(nodeId);
    };

    private handleOnRightClick = (nodeId: string) => () => {
        this.props.onContextMenu(nodeId);
    };

    render() {
        if (this.props.mapStore!.areNetworkLayersHidden) return null;
        if (!this.state.turfPointNodeFeatures) return null;

        const bounds = this.map.getBounds();

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

        const featuresToShow = pointsWithinPolygon(this.state.turfPointNodeFeatures, searchWithin)
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

        return featuresToShow.map((node: ISearchNode, index: number) => {
            return (
                <NodeMarker
                    key={`${node.id}-${index}`}
                    coordinates={node.coordinates}
                    nodeType={node.type}
                    transitTypes={node.transitTypes}
                    nodeLocationType={'coordinates'}
                    nodeId={node.id}
                    onClick={this.handleOnLeftClick(node.id)}
                    onContextMenu={this.handleOnRightClick(node.id)}
                    size={this.props.networkStore!.nodeSize}
                />
            );
        });
    }
}

export default NodeLayer;
