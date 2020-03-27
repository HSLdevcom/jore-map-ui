import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IoIosRadioButtonOn } from 'react-icons/io';
import { TiLink } from 'react-icons/ti';
import ToggleView, { ToggleItem } from '~/components/shared/ToggleView';
import NodeType from '~/enums/nodeType';
import { INode, IRoutePath, IRoutePathLink } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import { ListFilter, RoutePathStore } from '~/stores/routePathStore';
import RoutePathListLink from './RoutePathListLink';
import RoutePathListNode from './RoutePathListNode';
import RoutePathMassEditView from './RoutePathMassEditView';
import s from './routePathLinksTab.scss';

interface IRoutePathLinksTabProps {
    routePathStore?: RoutePathStore;
    routePath: IRoutePath;
    isEditingDisabled: boolean;
}

@inject('routePathStore')
@observer
class RoutePathLinksTab extends React.Component<IRoutePathLinksTabProps> {
    reactionDisposer: IReactionDisposer;
    listObjectReferences: {
        [id: string]: React.RefObject<HTMLDivElement>;
    } = {};

    constructor(props: IRoutePathLinksTabProps) {
        super(props);
        this.listObjectReferences = {};
    }

    componentDidMount() {
        this.reactionDisposer = reaction(
            () => this.props.routePathStore!.extendedListItems,
            this.onExtend
        );
        const showItemParam = navigator.getQueryParamValues()[QueryParams.showItem];
        if (showItemParam) {
            const itemId = showItemParam[0];
            const isExtended = this.props.routePathStore!.isListItemExtended(itemId);
            if (isExtended) this.scrollIntoListItem(itemId);
        }
    }

    componentWillUnmount() {
        this.reactionDisposer();
    }

    private renderList = (routePathLinks: IRoutePathLink[]) => {
        return routePathLinks.map((routePathLink, index) => {
            this.listObjectReferences[routePathLink.startNode.id] = React.createRef();
            this.listObjectReferences[routePathLink.id] = React.createRef();
            const result = [
                this.isNodeVisible(routePathLink.startNode) ? (
                    <RoutePathListNode
                        key={`${routePathLink.id}-${index}-startNode`}
                        reference={this.listObjectReferences[routePathLink.startNode.id]}
                        node={routePathLink.startNode}
                        routePathLink={routePathLink}
                        isEditingDisabled={this.props.isEditingDisabled}
                        isFirstNode={index === 0}
                        isLastNode={false}
                    />
                ) : null,
                this.isLinksVisible() ? (
                    <RoutePathListLink
                        key={`${routePathLink.id}-${index}-link`}
                        reference={this.listObjectReferences[routePathLink.id]}
                        routePathLink={routePathLink}
                    />
                ) : null
            ];

            if (index === routePathLinks.length - 1) {
                this.listObjectReferences[routePathLink.endNode.id] = React.createRef();
                if (this.isNodeVisible(routePathLink.endNode)) {
                    result.push(
                        <RoutePathListNode
                            key={`${routePathLink.id}-${index}-endNode`}
                            reference={this.listObjectReferences[routePathLink.endNode.id]}
                            node={routePathLink.endNode}
                            routePathLink={routePathLink}
                            isLastNode={true}
                            isEditingDisabled={this.props.isEditingDisabled}
                        />
                    );
                }
            }
            return result;
        });
    };

    private isNodeVisible = (node: INode) => {
        if (node.type === NodeType.STOP) {
            return !this.props.routePathStore!.listFilters.includes(ListFilter.stop);
        }
        return !this.props.routePathStore!.listFilters.includes(ListFilter.otherNodes);
    };

    private isLinksVisible = () => {
        return !this.props.routePathStore!.listFilters.includes(ListFilter.link);
    };

    private onExtend = () => {
        const extendedListItems = this.props.routePathStore!.extendedListItems;
        if (extendedListItems.length === 1) {
            const listItemId = extendedListItems[0];
            this.scrollIntoListItem(listItemId);
        }
    };

    private scrollIntoListItem = (listItemId: string) => {
        const item = this.listObjectReferences[listItemId].current!;
        if (item) {
            item.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
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
                <RoutePathMassEditView isEditingDisabled={this.props.isEditingDisabled} />
            </div>
        );
    }
}

export default RoutePathLinksTab;
