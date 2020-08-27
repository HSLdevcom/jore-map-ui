import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import StartNodeType from '~/enums/startNodeType';
import { INeighborLink, IRoutePathLink } from '~/models';
import { MapStore } from '~/stores/mapStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathStore } from '~/stores/routePathStore';
import RoutePathUtils from '~/utils/RoutePathUtils';
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

    private isNodeVisibleAtNeighborLinkLayer = (nodeId: string) => {
        return Boolean(
            this.props.routePathLayerStore!.neighborLinks.find(
                (link: INeighborLink) =>
                    link.routePathLink.startNode.id === nodeId ||
                    link.routePathLink.endNode.id === nodeId
            )
        );
    };

    render() {
        if (!this.props.routePathStore!.routePath) return null;

        const neighborLinks = this.props.routePathLayerStore!.neighborLinks;
        const isRoutePathCopySegmentLayerVisible =
            this.props.routePathCopySegmentStore!.startNode ||
            this.props.routePathCopySegmentStore!.endNode;
        const coherentRoutePathLinksList = RoutePathUtils.getCoherentRoutePathLinksList(
            this.props.routePathStore!.routePath!.routePathLinks
        );
        return (
            <div>
                {coherentRoutePathLinksList.length > 0 ? (
                    coherentRoutePathLinksList.map((routePathLinks) => {
                        return routePathLinks.map((rpLink: IRoutePathLink, index: number) => {
                            const isStartNodeDisabled =
                                rpLink.startNodeType === StartNodeType.DISABLED;
                            const isLastNode = index === routePathLinks.length - 1;
                            return (
                                <div key={`rpLink-${index}`}>
                                    {!this.isNodeVisibleAtNeighborLinkLayer(
                                        rpLink.startNode.id
                                    ) && (
                                        <EditRoutePathLayerNode
                                            key={'startNode'}
                                            node={rpLink.startNode}
                                            isDisabled={isStartNodeDisabled}
                                            linkOrderNumber={rpLink.orderNumber}
                                            setExtendedListItem={this.setExtendedListItem}
                                        />
                                    )}
                                    <EditRoutePathLayerLink
                                        enableMapClickListener={this.props.enableMapClickListener}
                                        disableMapClickListener={this.props.disableMapClickListener}
                                        rpLink={rpLink}
                                        setExtendedListItem={this.setExtendedListItem}
                                    />
                                    {isLastNode &&
                                        !this.isNodeVisibleAtNeighborLinkLayer(
                                            rpLink.endNode.id
                                        ) && (
                                            <EditRoutePathLayerNode
                                                key={'endNode'}
                                                node={rpLink.endNode}
                                                isDisabled={false} // endNode has no disabled information
                                                linkOrderNumber={rpLink.orderNumber}
                                                setExtendedListItem={this.setExtendedListItem}
                                            />
                                        )}
                                </div>
                            );
                        });
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
