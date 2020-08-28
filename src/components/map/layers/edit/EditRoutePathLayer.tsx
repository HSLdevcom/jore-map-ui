import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import StartNodeType from '~/enums/startNodeType';
import ToolbarToolType from '~/enums/toolbarToolType';
import { INeighborLink, IRoutePathLink } from '~/models';
import { MapStore } from '~/stores/mapStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import RoutePathUtils from '~/utils/RoutePathUtils';
import Marker from '../markers/Marker';
import EditRoutePathLayerLink from './EditRoutePathLayerLink';
import EditRoutePathLayerNode from './EditRoutePathLayerNode';
import RoutePathNeighborLinkLayer from './RoutePathNeighborLinkLayer';
import RoutePathCopySegmentLayer from './routePathCopySegmentLayer';

const START_MARKER_COLOR = '#00df0b';

interface IEditRoutePathLayerProps {
    enableMapClickListener: () => void;
    disableMapClickListener: () => void;
    routePathStore?: RoutePathStore;
    routePathLayerStore?: RoutePathLayerStore;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    mapStore?: MapStore;
    toolbarStore?: ToolbarStore;
}

@inject(
    'routePathStore',
    'routePathLayerStore',
    'routePathCopySegmentStore',
    'mapStore',
    'toolbarStore'
)
@observer
class EditRoutePathLayer extends Component<IEditRoutePathLayerProps> {
    private renderRoutePathLink = (
        rpLink: IRoutePathLink,
        routePathLinks: IRoutePathLink[],
        index: number
    ) => {
        const routePathLayerStore = this.props.routePathLayerStore!;
        const mapStore = this.props.mapStore!;
        const isStartNodeDisabled = rpLink.startNodeType === StartNodeType.DISABLED;
        const isLastNode = index === routePathLinks.length - 1;

        return (
            <div key={`rpLink-${index}`}>
                {!this.isNodeVisibleAtNeighborLinkLayer(rpLink.startNode.id) && (
                    <EditRoutePathLayerNode
                        key={'startNode'}
                        node={rpLink.startNode}
                        isDisabled={isStartNodeDisabled}
                        linkOrderNumber={rpLink.orderNumber}
                        isHighlightedByTool={routePathLayerStore!.toolHighlightedNodeIds.includes(
                            rpLink.startNode.internalId
                        )}
                        isHovered={
                            routePathLayerStore.hoveredItemId === rpLink.startNode.internalId
                        }
                        isExtended={
                            routePathLayerStore.extendedListItemId === rpLink.startNode.internalId
                        }
                        setHoveredItemId={routePathLayerStore.setHoveredItemId}
                    />
                )}
                <EditRoutePathLayerLink
                    rpLink={rpLink}
                    isLinkHovered={routePathLayerStore.hoveredItemId === rpLink.id}
                    isLinkExtended={routePathLayerStore.extendedListItemId === rpLink.id}
                    enableMapClickListener={this.props.enableMapClickListener}
                    disableMapClickListener={this.props.disableMapClickListener}
                    setExtendedListItem={this.setExtendedListItem}
                    setHoveredItemId={routePathLayerStore.setHoveredItemId}
                    isMapFilterEnabled={mapStore.isMapFilterEnabled}
                />
                {isLastNode && !this.isNodeVisibleAtNeighborLinkLayer(rpLink.endNode.id) && (
                    <EditRoutePathLayerNode
                        key={'endNode'}
                        node={rpLink.endNode}
                        isDisabled={false} // endNode has no disabled information
                        linkOrderNumber={rpLink.orderNumber}
                        isHighlightedByTool={routePathLayerStore!.toolHighlightedNodeIds.includes(
                            rpLink.endNode.internalId
                        )}
                        isHovered={routePathLayerStore.hoveredItemId === rpLink.endNode.internalId}
                        isExtended={
                            routePathLayerStore.extendedListItemId === rpLink.endNode.internalId
                        }
                        setHoveredItemId={routePathLayerStore.setHoveredItemId}
                    />
                )}
            </div>
        );
    };

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

    private renderStartMarker = () => {
        if (this.props.toolbarStore!.isSelected(ToolbarToolType.ExtendRoutePath)) {
            // Hiding start marker if we set target node adding new links.
            // Due to the UI otherwise getting messy
            return null;
        }

        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks || routePathLinks.length === 0 || !routePathLinks[0].startNode) {
            return null;
        }

        return (
            <Marker
                latLng={routePathLinks[0].startNode.coordinates}
                color={START_MARKER_COLOR}
                isClickDisabled={true}
            />
        );
    };

    render() {
        const routePathStore = this.props.routePathStore!;
        const routePathCopySegmentStore = this.props.routePathCopySegmentStore!;

        if (!routePathStore.routePath) return null;

        const neighborLinks = this.props.routePathLayerStore!.neighborLinks;
        const isRoutePathCopySegmentLayerVisible =
            routePathCopySegmentStore!.startNode || routePathCopySegmentStore!.endNode;
        const coherentRoutePathLinksList = RoutePathUtils.getCoherentRoutePathLinksList(
            routePathStore.routePath!.routePathLinks
        );
        return (
            <div>
                {coherentRoutePathLinksList.length > 0 ? (
                    <>
                        {coherentRoutePathLinksList.map((routePathLinks) => {
                            return routePathLinks.map((rpLink: IRoutePathLink, index: number) => {
                                return this.renderRoutePathLink(rpLink, routePathLinks, index);
                            });
                        })}
                        {this.renderStartMarker()}
                    </>
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
