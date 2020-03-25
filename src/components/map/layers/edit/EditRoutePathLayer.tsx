import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { MapStore } from '~/stores/mapStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathStore } from '~/stores/routePathStore';
import EditRoutePathLayerLink from './EditRoutePathLayerLink';
import EditRoutePathLayerNode from './EditRoutePathLayerNode';
import RoutePathNeighborLinkLayer from './RoutePathNeighborLinkLayer';
import RoutePathCopySegmentLayer from './routePathCopySegmentLayer';

interface IEditRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    mapStore?: MapStore;
}

@inject('routePathStore', 'routePathCopySegmentStore', 'mapStore')
@observer
class EditRoutePathLayer extends Component<IEditRoutePathLayerProps> {
    private highlightItemById = (id: string) => {
        // Switch to info tab
        this.props.routePathStore!.setSelectedTabIndex(1);
        // Close all extended objects, in order to be able to calculate final height of items
        this.props.routePathStore!.setExtendedListItems([]);
        // Set extended object, which will trigger automatic scroll
        this.props.routePathStore!.setExtendedListItems([id]);
        // Set highlight
        this.props.routePathStore!.setListHighlightedNodeIds([id]);
    };

    render() {
        if (!this.props.routePathStore!.routePath) return null;

        const neighborLinks = this.props.routePathStore!.neighborLinks;
        const isRoutePathCopySegmentLayerVisible =
            this.props.routePathCopySegmentStore!.startNode ||
            this.props.routePathCopySegmentStore!.endNode;
        return (
            <div>
                <EditRoutePathLayerNode highlightItemById={this.highlightItemById} />
                <EditRoutePathLayerLink highlightItemById={this.highlightItemById} />
                {neighborLinks && <RoutePathNeighborLinkLayer />}
                {isRoutePathCopySegmentLayerVisible && <RoutePathCopySegmentLayer />}
            </div>
        );
    }
}

export default EditRoutePathLayer;
