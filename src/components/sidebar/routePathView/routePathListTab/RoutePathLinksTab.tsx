import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IoIosRadioButtonOn } from 'react-icons/io';
import { TiLink } from 'react-icons/ti';
import ToggleView, { ToggleItem } from '~/components/shared/ToggleView';
import NodeType from '~/enums/nodeType';
import { INode, IRoutePath, IRoutePathLink } from '~/models';
import { RoutePathLinkMassEditStore } from '~/stores/routePathLinkMassEditStore';
import { ListFilter, RoutePathStore } from '~/stores/routePathStore';
import RoutePathLinkMassEditView from './RoutePathLinkMassEditView';
import RoutePathListLink from './RoutePathListLink';
import RoutePathListNode from './RoutePathListNode';
import s from './routePathLinksTab.scss';

interface IRoutePathLinksTabProps {
    routePath: IRoutePath;
    isEditingDisabled: boolean;
    routePathStore?: RoutePathStore;
    routePathLinkMassEditStore?: RoutePathLinkMassEditStore;
}

@inject('routePathStore', 'routePathLinkMassEditStore')
@observer
class RoutePathLinksTab extends React.Component<IRoutePathLinksTabProps> {
    private extendedItemListener: IReactionDisposer;
    listObjectReferences: { [id: string]: React.RefObject<HTMLDivElement> } = {};

    constructor(props: IRoutePathLinksTabProps) {
        super(props);
        this.listObjectReferences = {};
        this.extendedItemListener = reaction(
            () => this.props.routePathStore!.extendedListItemId,
            this.onListItemExtend
        );
    }

    componentWillUnmount() {
        this.extendedItemListener();
    }

    /**
     * @param {IRoutePathLink[]} routePathLinks - list of routePathLinks sorted by orderNumber
     */
    private renderList = (routePathLinks: IRoutePathLink[]) => {
        // Split routePathLinks into sub lists with coherent routePathLinks
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

        return coherentRoutePathLinksList.map((routePathLinks) =>
            routePathLinks.map((routePathLink, index) => {
                // Use node.internalId as key instead of id because there might be nodes with the same id
                this.listObjectReferences[routePathLink.startNode.internalId] = React.createRef();
                this.listObjectReferences[routePathLink.id] = React.createRef();
                const result = [
                    this.isNodeVisible(routePathLink.startNode) ? (
                        <RoutePathListNode
                            key={`${routePathLink.id}-${index}-startNode`}
                            reference={
                                this.listObjectReferences[routePathLink.startNode.internalId]
                            }
                            node={routePathLink.startNode}
                            routePathLink={routePathLink}
                            isEditingDisabled={this.props.isEditingDisabled}
                            isFirstNode={index === 0}
                            isLastNode={false}
                        />
                    ) : null,
                    this.areLinksVisible() ? (
                        <RoutePathListLink
                            key={`${routePathLink.id}-${index}-link`}
                            reference={this.listObjectReferences[routePathLink.id]}
                            routePathLink={routePathLink}
                        />
                    ) : null,
                ];

                if (index === routePathLinks.length - 1) {
                    if (this.isNodeVisible(routePathLink.endNode)) {
                        // Use node.internalId as key instead of id because there might be nodes with the same id
                        this.listObjectReferences[
                            routePathLink.endNode.internalId
                        ] = React.createRef();
                        result.push(
                            <RoutePathListNode
                                key={`${routePathLink.id}-${index}-endNode`}
                                reference={
                                    this.listObjectReferences[routePathLink.endNode.internalId]
                                }
                                node={routePathLink.endNode}
                                routePathLink={routePathLink}
                                isLastNode={true}
                                isEditingDisabled={this.props.isEditingDisabled}
                            />
                        );
                    }
                }
                return result;
            })
        );
    };

    private onListItemExtend = () => {
        const extendedListItemId = this.props.routePathStore!.extendedListItemId;
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

    render() {
        const routePathLinks = this.props.routePath.routePathLinks;
        if (!routePathLinks) return null;

        const listFilters = this.props.routePathStore!.listFilters;

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
                    <div className={s.list}>{this.renderList(routePathLinks)}</div>
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
