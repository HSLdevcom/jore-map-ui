import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IoIosRadioButtonOn } from 'react-icons/io';
import { TiLink } from 'react-icons/ti';
import ToggleView, { ToggleItem } from '~/components/shared/ToggleView';
import NodeType from '~/enums/nodeType';
import { INeighborLink, INode, IRoutePath, IRoutePathLink } from '~/models';
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
import RoutePathListNeighborLink from './RoutePathListNeighborLink';
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

    componentDidMount() {
        const extendedListItemId = this.props.routePathLayerStore!.extendedListItemId;
        if (extendedListItemId) {
            this.scrollIntoListItem(extendedListItemId);
        }
    }

    private onListItemExtend = () => {
        const extendedListItemId = this.props.routePathLayerStore!.extendedListItemId;
        if (extendedListItemId) {
            this.scrollIntoListItem(extendedListItemId);
        }
    };

    private scrollIntoListItem = (listItemId: string) => {
        // Next tick is needed because this way the possible previously opened item gets closed before the next one gets opened
        process.nextTick(() => {
            const item = this.listObjectReferences[listItemId];
            if (item && item.current) {
                item.current.scrollIntoView({
                    inline: 'start',
                    block: 'start',
                    behavior: 'smooth',
                });
            }
        });
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
        key,
        node,
        isFirstNode,
        isLastNode,
        upperGapClosingNeighborLink,
        bottomGapClosingNeighborLink,
    }: {
        routePathLink: IRoutePathLink;
        key: string;
        node: INode;
        isFirstNode: boolean;
        isLastNode: boolean;
        upperGapClosingNeighborLink: INeighborLink | null;
        bottomGapClosingNeighborLink: INeighborLink | null;
    }) => {
        if (!this.isNodeVisible(node)) return null;

        const routePathLayerStore = this.props.routePathLayerStore!;
        const routePathLinkMassEditStore = this.props.routePathLinkMassEditStore!;

        const routePath = this.props.routePathStore!.routePath;
        const isStartNodeUsingBookSchedule = isLastNode
            ? routePath!.isStartNodeUsingBookSchedule
            : routePathLink.isStartNodeUsingBookSchedule;
        const startNodeBookScheduleColumnNumber = isLastNode
            ? routePath!.startNodeBookScheduleColumnNumber
            : routePathLink.startNodeBookScheduleColumnNumber;
        const isNeighborLinkHighlighted = upperGapClosingNeighborLink
            ? upperGapClosingNeighborLink.routePathLink.id ===
              routePathLayerStore.highlightedNeighborLinkId
            : bottomGapClosingNeighborLink
            ? bottomGapClosingNeighborLink.routePathLink.id ===
              routePathLayerStore.highlightedNeighborLinkId
            : false;
        const isRoutePathNodeValid = isLastNode
            ? this.props.routePathStore!.invalidPropertiesMap['startNodeBookScheduleColumnNumber']
                  .isValid
            : this.props.routePathStore!.getIsRoutePathLinkValid(routePathLink.id);
        return (
            <RoutePathListNode
                key={key}
                ref={this.listObjectReferences[node.internalId]}
                node={node}
                routePathLink={routePathLink}
                isEditingDisabled={this.props.isEditingDisabled}
                isFirstNode={isFirstNode}
                isLastNode={isLastNode}
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
                isNeighborLinkHighlighted={isNeighborLinkHighlighted}
                upperGapClosingNeighborLink={upperGapClosingNeighborLink}
                bottomGapClosingNeighborLink={bottomGapClosingNeighborLink}
                invalidRoutePathNodeClassName={
                    !isRoutePathNodeValid ? s.invalidRoutePathNode : undefined
                }
            />
        );
    };

    private renderRpListLink = ({
        routePathLink,
        areLinksVisible,
        key,
    }: {
        routePathLink: IRoutePathLink;
        areLinksVisible: boolean;
        key: string;
    }) => {
        if (!areLinksVisible) return null;
        const routePathLayerStore = this.props.routePathLayerStore!;
        return (
            <RoutePathListLink
                key={key}
                ref={this.listObjectReferences[routePathLink.id]}
                routePathLink={routePathLink}
                isExtended={routePathLayerStore.extendedListItemId === routePathLink.id}
                isHovered={routePathLayerStore.hoveredItemId === routePathLink.id}
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
        const areLinksVisible = this.areLinksVisible();
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
                        data-cy='linksToggle'
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
                                const shouldRenderLastNode = index === routePathLinks.length - 1;
                                const gapClosingNeighborLink = this.props.routePathLayerStore!
                                    .gapClosingNeighborLink;
                                const isEndNodeAttachedToGapClosingNeighborLink =
                                    gapClosingNeighborLink &&
                                    routePathLink.endNode.id ===
                                        gapClosingNeighborLink.routePathLink.startNode.id;
                                const isStartNodeAttachedToGapClosingNeighborLink =
                                    gapClosingNeighborLink &&
                                    routePathLink.startNode.id ===
                                        gapClosingNeighborLink.routePathLink.endNode.id;
                                const isNeighborLinkHighlighted =
                                    gapClosingNeighborLink?.routePathLink.id ===
                                    this.props.routePathLayerStore!.highlightedNeighborLinkId;

                                // Use node.internalId as key instead of id because there might be nodes with the same id
                                this.listObjectReferences[startNode.internalId] = React.createRef();
                                this.listObjectReferences[routePathLink.id] = React.createRef();
                                if (shouldRenderLastNode) {
                                    this.listObjectReferences[
                                        endNode.internalId
                                    ] = React.createRef();
                                }
                                return (
                                    <React.Fragment key={index}>
                                        {this.renderRpListNode({
                                            routePathLink,
                                            key: `${routePathLink.id}-${index}-startNode`,
                                            node: routePathLink.startNode,
                                            isFirstNode: index === 0,
                                            isLastNode: false,
                                            upperGapClosingNeighborLink: isStartNodeAttachedToGapClosingNeighborLink
                                                ? gapClosingNeighborLink
                                                : null,
                                            bottomGapClosingNeighborLink: null,
                                        })}
                                        {this.renderRpListLink({
                                            routePathLink,
                                            areLinksVisible,
                                            key: `${routePathLink.id}-${index}-link`,
                                        })}
                                        {shouldRenderLastNode && (
                                            <>
                                                {this.renderRpListNode({
                                                    routePathLink,
                                                    key: `${routePathLink.id}-${index}-endNode`,
                                                    node: routePathLink.endNode,
                                                    isFirstNode: false,
                                                    isLastNode: true,
                                                    upperGapClosingNeighborLink: null,
                                                    bottomGapClosingNeighborLink: isEndNodeAttachedToGapClosingNeighborLink
                                                        ? gapClosingNeighborLink
                                                        : null,
                                                })}
                                                {isEndNodeAttachedToGapClosingNeighborLink && (
                                                    <RoutePathListNeighborLink
                                                        neighborLink={gapClosingNeighborLink!}
                                                        isNeighborLinkHighlighted={
                                                            isNeighborLinkHighlighted
                                                        }
                                                    />
                                                )}
                                            </>
                                        )}
                                    </React.Fragment>
                                );
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
