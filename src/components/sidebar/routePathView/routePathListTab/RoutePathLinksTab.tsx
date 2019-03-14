
import React from 'react';
import { inject, observer } from 'mobx-react';
import { IReactionDisposer, reaction } from 'mobx';
import { IRoutePath, IRoutePathLink, INode } from '~/models';
import { TiLink } from 'react-icons/ti';
import { IoIosRadioButtonOn } from 'react-icons/io';
import ToggleView, { ToggleItem } from '~/components/shared/ToggleView';
import { RoutePathStore } from '~/stores/routePathStore';
import s from './routePathLinksTab.scss';
import RoutePathListNode from './RoutePathListNode';
import RoutePathListLink from './RoutePathListLink';

interface IRoutePathLinksTabProps {
    routePathStore?: RoutePathStore;
    routePath: IRoutePath;
}

enum ListFilter {
    stop,
    otherNodes,
    link,
}

interface IRoutePathLinksTabState {
    listFilters: ListFilter[];
}

@inject('routePathStore')
@observer
class RoutePathLinksTab extends React.Component<IRoutePathLinksTabProps, IRoutePathLinksTabState>{
    reactionDisposer: IReactionDisposer;
    listObjectReferences: { [id: string] : React.RefObject<HTMLDivElement> } = {};

    constructor(props: IRoutePathLinksTabProps) {
        super(props);
        this.listObjectReferences = {};
        this.state = {
            listFilters: [ListFilter.link],
        };
    }

    componentDidMount() {
        this.reactionDisposer = reaction(
            () => this.props.routePathStore!.extendedObjects,
            this.onExtend,
        );
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
                    />
                ) : null,
                this.isLinksVisible() ?
                (
                    <RoutePathListLink
                        key={`${routePathLink.id}-${index}-link`}
                        reference={this.listObjectReferences[routePathLink.id]}
                        routePathLink={routePathLink}
                    />
                ) : null];

            if (index === routePathLinks.length - 1) {
                this.listObjectReferences[routePathLink.endNode.id] = React.createRef();
                if (this.isNodeVisible(routePathLink.endNode)) {
                    result.push(
                        <RoutePathListNode
                            key={`${routePathLink.id}-${index}-endNode`}
                            reference={this.listObjectReferences[routePathLink.endNode.id]}
                            node={routePathLink.endNode}
                            routePathLink={routePathLink}
                        />,
                    );
                }
            }
            return result;
        });
    }

    private isNodeVisible = (node: INode) => {
        if (node.stop && this.state.listFilters.includes(ListFilter.stop)) return false;
        if (!node.stop && this.state.listFilters.includes(ListFilter.otherNodes)) return false;
        return true;
    }

    private isLinksVisible = () => {
        return !this.state.listFilters.includes(ListFilter.link);
    }

    private onExtend = () => {
        const extendedObjects = this.props.routePathStore!.extendedObjects;
        if (extendedObjects.length === 1) {
            const id = extendedObjects[0];
            const item = this.listObjectReferences[id].current!;
            item.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    toggleFilter = (listFilter: ListFilter) => {
        let listFilters = this.state.listFilters;
        if (listFilters.includes(listFilter)) {
            listFilters = listFilters.filter(mF => mF !== listFilter);
        } else {
            listFilters.push(listFilter);
        }
        this.setState({
            listFilters,
        });
    }

    render() {
        const routePathLinks = this.props.routePath.routePathLinks;
        if (!routePathLinks) return null;

        return (
            <div className={s.RoutePathLinksTabView}>
                <ToggleView>
                    <ToggleItem
                        icon={<IoIosRadioButtonOn />}
                        text='Pysäkit'
                        isActive={!this.state.listFilters.includes(ListFilter.stop)}
                        onClick={this.toggleFilter.bind(this, ListFilter.stop)}
                    />
                    <ToggleItem
                        icon={<IoIosRadioButtonOn />}
                        text='Muut solmut'
                        isActive={!this.state.listFilters.includes(ListFilter.otherNodes)}
                        onClick={this.toggleFilter.bind(this, ListFilter.otherNodes)}
                    />
                    <ToggleItem
                        icon={<TiLink />}
                        text='Linkit'
                        isActive={!this.state.listFilters.includes(ListFilter.link)}
                        onClick={this.toggleFilter.bind(this, ListFilter.link)}
                    />
                </ToggleView>
                <div
                    className={s.list}
                >
                    {this.renderList(routePathLinks)}
                </div>
            </div>
        );
    }
}

export default RoutePathLinksTab;
