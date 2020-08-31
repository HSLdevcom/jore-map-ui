import * as L from 'leaflet';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IoIosRadioButtonOn } from 'react-icons/io';
import { TiLink } from 'react-icons/ti';
import ToggleView, { ToggleItem } from '~/components/shared/ToggleView';
import NodeType from '~/enums/nodeType';
import { INode, IRoutePath, IRoutePathLink } from '~/models';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import { MapStore } from '~/stores/mapStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathLinkMassEditStore } from '~/stores/routePathLinkMassEditStore';
import { ListFilter, RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import RoutePathUtils from '~/utils/RoutePathUtils';
import RoutePathLinkMassEditView from './RoutePathLinkMassEditView';
import RoutePathListLink from './RoutePathListLink';
import RoutePathListNode from './RoutePathListNode';
import s from './routePathLinksTab.scss';

interface IRoutePathLinksTabProps {
    routePath: IRoutePath;
    isEditingDisabled: boolean;
    routePathStore?: RoutePathStore;
    routePathLayerStore?: RoutePathLayerStore;
    routePathLinkMassEditStore?: RoutePathLinkMassEditStore;
    mapStore?: MapStore;
    codeListStore?: CodeListStore;
    toolbarStore?: ToolbarStore;
    errorStore?: ErrorStore;
}

@inject(
    'routePathStore',
    'routePathLayerStore',
    'routePathLinkMassEditStore',
    'mapStore',
    'codeListStore',
    'toolbarStore',
    'errorStore'
)
@observer
class RoutePathLinksTab extends React.Component<IRoutePathLinksTabProps> {
    private extendedItemListener: IReactionDisposer;
    listObjectReferences: { [id: string]: React.RefObject<HTMLDivElement> } = {};

    constructor(props: IRoutePathLinksTabProps) {
        super(props);
        this.listObjectReferences = {};
        this.extendedItemListener = reaction(
            () => this.props.routePathLayerStore!.extendedListItemId,
            this.onListItemExtend
        );
    }

    componentWillUnmount() {
        this.extendedItemListener();
    }

    private onListItemExtend = () => {
        const extendedListItemId = this.props.routePathLayerStore!.extendedListItemId;
        if (extendedListItemId) {
            this.scrollIntoListItem(extendedListItemId);
        }
    };

    private scrollIntoListItem = (listItemId: string) => {
        const item = this.listObjectReferences[listItemId].current!;
        if (item) {
            // use setTimeout so that listItem will be extended before scrolling to get the final positioning better
            setTimeout(() => {
                item.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 25);
        }
    };

    private isNodeVisible = (node: INode) => {
        if (node.type === NodeType.STOP) {
            return !this.props.routePathStore!.listFilters.includes(ListFilter.stop);
        }
        return !this.props.routePathStore!.listFilters.includes(ListFilter.otherNodes);
    };

    private areLinksVisible = () => {
        return !this.props.routePathStore!.listFilters.includes(ListFilter.link);
    };

    private toggleListFilter = (listFilter: ListFilter) => {
        this.props.routePathStore!.toggleListFilter(listFilter);
    };

    private renderRpListNode = ({
        routePathLink,
        node,
        isFirstNode,
        isLastNode,
        key,
    }: {
        routePathLink: IRoutePathLink;
        node: INode;
        isFirstNode: boolean;
        isLastNode: boolean;
        key: string;
    }) => {
        const routePathLayerStore = this.props.routePathLayerStore!;
        const routePathStore = this.props.routePathStore!;
        const routePathLinkMassEditStore = this.props.routePathLinkMassEditStore!;
        const mapStore = this.props.mapStore!;
        const codeListStore = this.props.codeListStore!;
        const toolbarStore = this.props.toolbarStore!;
        const errorStore = this.props.errorStore!;

        const setMapBoundsToRpLink = () => {
            const geometry = routePathStore.getLinkGeom(routePathLink.id);
            const bounds: L.LatLngBounds = new L.LatLngBounds([]);
            geometry.forEach((geom: L.LatLng) => bounds.extend(geom));
            mapStore.setMapBounds(bounds);
        };

        const routePath = this.props.routePathStore!.routePath;
        const isStartNodeUsingBookSchedule = isLastNode
            ? routePath!.isStartNodeUsingBookSchedule
            : routePathLink.isStartNodeUsingBookSchedule;
        const startNodeBookScheduleColumnNumber = isLastNode
            ? routePath!.startNodeBookScheduleColumnNumber
            : routePathLink.startNodeBookScheduleColumnNumber;

        return (
            <RoutePathListNode
                key={key}
                reference={this.listObjectReferences[node.internalId]}
                node={node}
                routePathLink={routePathLink}
                isEditingDisabled={this.props.isEditingDisabled}
                isFirstNode={isFirstNode}
                isLastNode={isLastNode}
                invalidPropertiesMap={routePathStore.getRoutePathLinkInvalidPropertiesMap(
                    routePathLink.id
                )}
                isHighlightedByTool={routePathLayerStore.toolHighlightedNodeIds.includes(
                    node.internalId
                )}
                isExtended={routePathLayerStore.extendedListItemId === node.internalId}
                isHovered={routePathLayerStore.hoveredItemId === node.internalId}
                isStartNodeUsingBookSchedule={isStartNodeUsingBookSchedule}
                startNodeBookScheduleColumnNumber={startNodeBookScheduleColumnNumber}
                selectedRoutePathLinkIndex={routePathLinkMassEditStore!.getSelectedRoutePathLinkIndex(
                    routePathLink
                )}
                selectedTool={toolbarStore.selectedTool}
                setExtendedListItemId={routePathLayerStore.setExtendedListItemId}
                setHoveredItemId={routePathLayerStore.setHoveredItemId}
                setIsEditingDisabled={routePathStore.setIsEditingDisabled}
                updateRoutePathProperty={routePathStore.updateRoutePathProperty}
                updateRoutePathLinkProperty={routePathStore.updateRoutePathLinkProperty}
                setMapBoundsToRpLink={setMapBoundsToRpLink}
                toggleSelectedRoutePathLink={routePathLinkMassEditStore.toggleSelectedRoutePathLink}
                getDropdownItemList={codeListStore.getDropdownItemList}
                addErrorToErrorStore={errorStore.addError}
            />
        );
    };

    render() {
        const routePathLinks = this.props.routePath.routePathLinks;
        if (!routePathLinks) return null;

        const listFilters = this.props.routePathStore!.listFilters;
        const coherentRoutePathLinksList = RoutePathUtils.getCoherentRoutePathLinksList(
            routePathLinks
        );
        return (
            <div className={s.routePathLinksTabView}>
                <ToggleView>
                    <ToggleItem
                        icon={<IoIosRadioButtonOn />}
                        text='Pysäkit'
                        isActive={!listFilters.includes(ListFilter.stop)}
                        onClick={() => this.toggleListFilter(ListFilter.stop)}
                    />
                    <ToggleItem
                        icon={<IoIosRadioButtonOn />}
                        text='Muut solmut'
                        isActive={!listFilters.includes(ListFilter.otherNodes)}
                        onClick={() => this.toggleListFilter(ListFilter.otherNodes)}
                    />
                    <ToggleItem
                        icon={<TiLink />}
                        text='Linkit'
                        isActive={!listFilters.includes(ListFilter.link)}
                        onClick={() => this.toggleListFilter(ListFilter.link)}
                    />
                </ToggleView>
                <div className={s.listHeader}>
                    <div className={s.name}>Nimi</div>
                    <div className={s.hastusId}>Hastus id</div>
                    <div className={s.longId}>Pitkä id</div>
                    <div className={s.shortId}>Lyhyt id</div>
                    <div className={s.via}>Määränpää</div>
                    <div className={s.via}>Määränpää kilpi</div>
                </div>
                <div className={s.listWrapper}>
                    <div className={s.list}>
                        {coherentRoutePathLinksList.map((routePathLinks) => {
                            return routePathLinks.map((routePathLink, index) => {
                                const startNode = routePathLink.startNode;
                                const endNode = routePathLink.endNode;
                                // Use node.internalId as key instead of id because there might be nodes with the same id
                                this.listObjectReferences[startNode.internalId] = React.createRef();
                                this.listObjectReferences[routePathLink.id] = React.createRef();
                                const result = [
                                    this.isNodeVisible(startNode)
                                        ? this.renderRpListNode({
                                              routePathLink,
                                              node: routePathLink.startNode,
                                              isFirstNode: index === 0,
                                              isLastNode: false,
                                              key: `${routePathLink.id}-${index}-startNode`,
                                          })
                                        : null,
                                    this.areLinksVisible() ? (
                                        <RoutePathListLink
                                            key={`${routePathLink.id}-${index}-link`}
                                            reference={this.listObjectReferences[routePathLink.id]}
                                            routePathLink={routePathLink}
                                        />
                                    ) : null,
                                ];

                                if (index === routePathLinks.length - 1) {
                                    if (this.isNodeVisible(endNode)) {
                                        // Use node.internalId as key instead of id because there might be nodes with the same id
                                        this.listObjectReferences[
                                            endNode.internalId
                                        ] = React.createRef();
                                        result.push(
                                            this.renderRpListNode({
                                                routePathLink,
                                                node: routePathLink.endNode,
                                                isFirstNode: index === 0,
                                                isLastNode: true,
                                                key: `${routePathLink.id}-${index}-endNode`,
                                            })
                                        );
                                    }
                                }
                                return result;
                            });
                        })}
                    </div>
                </div>
                <RoutePathLinkMassEditView
                    isEditingDisabled={this.props.isEditingDisabled}
                    routePathLinks={
                        this.props.routePathLinkMassEditStore!.selectedMassEditRoutePathLinks
                    }
                />
            </div>
        );
    }
}

export default RoutePathLinksTab;
