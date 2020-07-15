import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
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

@inject('searchResultStore', 'mapStore', 'networkStore', 'routePathStore')
@observer
class NodeLayer extends React.Component<INodeLayerProps> {
    private map: L.Map;

    constructor(props: INodeLayerProps) {
        super(props);
        this.map = this.props.map.current.leafletElement;
        // Render always when map moves
        this.map.on('moveend', () => {
            this.forceUpdate();
        });

        reaction(
            () =>
                this.props.routePathStore!.routePath &&
                this.props.routePathStore!.routePath.routePathLinks.length,
            () => this.forceUpdate()
        );
    }

    render() {
        if (this.props.mapStore!.areNetworkLayersHidden) return null;
        const bounds = this.map.getBounds();

        const nodesToShow = this.props
            .searchResultStore!.allNodes.filter((node) => {
                return bounds.contains(node.coordinates);
            })
            .filter((node) => {
                return !isNetworkNodeHidden({
                    nodeId: node.id,
                    transitTypeCodes: node.transitTypes.join(','),
                    dateRangesString: node.dateRanges,
                });
            });

        return nodesToShow.map((node: ISearchNode, index: number) => {
            return (
                <NodeMarker
                    key={`${node.id}-${index}`}
                    coordinates={node.coordinates}
                    nodeType={node.type}
                    nodeLocationType={'coordinates'}
                    nodeId={node.id}
                    onClick={this.props.onClick}
                    onContextMenu={this.props.onContextMenu}
                    size={this.props.networkStore!.nodeSize}
                />
            );
        });
    }
}

export default NodeLayer;
