import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import StartNodeType from '~/enums/startNodeType';
import ToolbarToolType from '~/enums/toolbarToolType';
import { IRoutePathLink } from '~/models';
import { MapStore } from '~/stores/mapStore';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
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
    private setExtendedListItem = (id: string | null) => {
        // Switch to info tab
        if (id) {
            this.props.routePathStore!.setSelectedTabIndex(1);
        }
        this.props.routePathLayerStore!.setExtendedListItemId(id);
    };

    // Split routePathLinks into sub lists with coherent routePathLinks
    private getCoherentRoutePathLinks = (routePathLinks: IRoutePathLink[]) => {
        const coherentRoutePathLinksList: IRoutePathLink[][] = [];
        let index = 0;
        routePathLinks.forEach((currentRpLink) => {
            const currentList = coherentRoutePathLinksList[index];
            if (!currentList && index === 0) {
                coherentRoutePathLinksList[index] = [currentRpLink];
                return;
            }
            const lastRpLink = currentList[currentList.length - 1];
            if (lastRpLink.endNode.id === currentRpLink.startNode.id) {
                currentList.push(currentRpLink);
            } else {
                const newList = [currentRpLink];
                coherentRoutePathLinksList.push(newList);
                index += 1;
            }
        });
        return coherentRoutePathLinksList;
    };

    render() {
        if (!this.props.routePathStore!.routePath) return null;

        const neighborLinks = this.props.routePathLayerStore!.neighborLinks;
        const isRoutePathCopySegmentLayerVisible =
            this.props.routePathCopySegmentStore!.startNode ||
            this.props.routePathCopySegmentStore!.endNode;
        const coherentRoutePathLinks = this.getCoherentRoutePathLinks(
            this.props.routePathStore!.routePath!.routePathLinks
        );
        return (
            <div>
                {coherentRoutePathLinks.length > 0 ? (
                    coherentRoutePathLinks.map((routePathLinks) => {
                        return routePathLinks.map((rpLink: IRoutePathLink, index: number) => {
                            const isStartNodeDisabled =
                                rpLink.startNodeType === StartNodeType.DISABLED;
                            const isFirstNode = index === 0;
                            const isLastNode = index === routePathLinks.length - 1;
                            const isExtendRpToolActive = this.props.toolbarStore!.isSelected(
                                ToolbarToolType.AddNewRoutePathLink
                            );
                            return (
                                <div key={`rpLink-${index}`}>
                                    <EditRoutePathLayerNode
                                        key={'startNode'}
                                        node={rpLink.startNode}
                                        isDisabled={isStartNodeDisabled}
                                        linkOrderNumber={rpLink.orderNumber}
                                        setExtendedListItem={this.setExtendedListItem}
                                        isHighlightedByExtendRpTool={
                                            isExtendRpToolActive && isFirstNode
                                        }
                                    />
                                    <EditRoutePathLayerLink
                                        enableMapClickListener={this.props.enableMapClickListener}
                                        disableMapClickListener={this.props.disableMapClickListener}
                                        rpLink={rpLink}
                                        setExtendedListItem={this.setExtendedListItem}
                                    />
                                    {isLastNode && (
                                        <EditRoutePathLayerNode
                                            key={'endNode'}
                                            node={rpLink.endNode}
                                            isDisabled={false} // endNode has no disabled information
                                            linkOrderNumber={rpLink.orderNumber}
                                            setExtendedListItem={this.setExtendedListItem}
                                            isHighlightedByExtendRpTool={isExtendRpToolActive}
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
