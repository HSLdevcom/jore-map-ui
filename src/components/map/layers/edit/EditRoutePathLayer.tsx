import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { IRoutePathLink } from '~/models';
import { MapStore } from '~/stores/mapStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathStore } from '~/stores/routePathStore';
import EditRoutePathLayerLink from './EditRoutePathLayerLink';
import EditRoutePathLayerNode from './EditRoutePathLayerNode';
import RoutePathNeighborLinkLayer from './RoutePathNeighborLinkLayer';
import RoutePathCopySegmentLayer from './routePathCopySegmentLayer';

interface IEditRoutePathLayerProps {
    enableMapClickListener: () => void;
    disableMapClickListener: () => void;
    routePathStore?: RoutePathStore;
    routePathLayerStore?: RoutePathLayerStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    mapStore?: MapStore;
}

@inject('routePathStore', 'routePathLayerStore', 'routePathCopySegmentStore', 'mapStore')
@observer
class EditRoutePathLayer extends Component<IEditRoutePathLayerProps> {
    private setExtendedListItem = (id: string | null) => {
        // Switch to info tab
        if (id) {
            this.props.routePathStore!.setSelectedTabIndex(1);
        }
        this.props.routePathLayerStore!.setExtendedListItemId(id);
    };

    render() {
        if (!this.props.routePathStore!.routePath) return null;

        const neighborLinks = this.props.routePathLayerStore!.neighborLinks;
        const isRoutePathCopySegmentLayerVisible =
            this.props.routePathCopySegmentStore!.startNode ||
            this.props.routePathCopySegmentStore!.endNode;
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        return (
            <div>
                {routePathLinks && routePathLinks.length > 0 ? (
                    routePathLinks.map((rpLink: IRoutePathLink, index: number) => {
                        const nextRpLink =
                            index < routePathLinks.length - 1
                                ? routePathLinks[index + 1]
                                : undefined;
                        const isEndNodeRendered =
                            !nextRpLink ||
                            (nextRpLink && nextRpLink.startNode.id !== rpLink.endNode.id);
                        return (
                            <div key={`rpLink-${index}`}>
                                <EditRoutePathLayerNode
                                    rpLink={rpLink}
                                    isEndNodeRendered={isEndNodeRendered}
                                    setExtendedListItem={this.setExtendedListItem}
                                />
                                <EditRoutePathLayerLink
                                    enableMapClickListener={this.props.enableMapClickListener}
                                    disableMapClickListener={this.props.disableMapClickListener}
                                    rpLink={rpLink}
                                    setExtendedListItem={this.setExtendedListItem}
                                />
                            </div>
                        );
                    })
                ) : (
                    <div />
                )}
                {neighborLinks && <RoutePathNeighborLinkLayer />}
                {isRoutePathCopySegmentLayerVisible && <RoutePathCopySegmentLayer />}
            </div>
        );
    }
}

export default EditRoutePathLayer;
