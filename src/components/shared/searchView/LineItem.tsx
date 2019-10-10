import classNames from 'classnames';
import React from 'react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import ReactMoment from 'react-moment';
import ISearchLine from '~/models/searchModels/ISearchLine';
import ISearchLineRoute from '~/models/searchModels/ISearchLineRoute';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import RouteBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import searchStore from '~/stores/searchStore';
import TransitTypeHelper from '~/util/TransitTypeHelper';
import lineHelper from '~/util/lineHelper';
import LineItemSubMenu from './LineItemSubMenu';
import * as s from './lineItem.scss';

interface ILineItemState {
    openRouteIds: string[];
}

interface ILineItemProps {
    line: ISearchLine;
}

class LineItem extends React.Component<ILineItemProps, ILineItemState> {
    constructor(props: ILineItemProps) {
        super(props);
        this.state = {
            openRouteIds: []
        };
    }

    private isRouteOpen(routeId: string) {
        return this.state.openRouteIds.some(id => id === routeId);
    }

    private openRouteMenu(routeId: string) {
        this.setState({
            openRouteIds: this.state.openRouteIds.concat(routeId)
        });
    }

    private closeRouteMenu(routeId: string) {
        this.setState({
            openRouteIds: this.state.openRouteIds.filter(id => id !== routeId)
        });
    }

    private toggleRouteMenu = (routeId: string) => (e: any) => {
        e.stopPropagation();
        if (this.isRouteOpen(routeId)) {
            this.closeRouteMenu(routeId);
        } else {
            this.openRouteMenu(routeId);
        }
    };

    private openRoute = (routeId: string) => () => {
        const openRouteLink = RouteBuilder.to(SubSites.routes)
            .append(QueryParams.routes, routeId)
            .toLink();
        searchStore.setSearchInput('');
        searchStore.removeAllSubLineItems();
        navigator.goTo(openRouteLink);
    };

    private renderRoute(route: ISearchLineRoute): any {
        return (
            <div key={route.id} className={s.routeItem}>
                <div className={s.routeItemHeader}>
                    <div className={s.routePathToggle} onClick={this.toggleRouteMenu(route.id)}>
                        {this.isRouteOpen(route.id) ? <FaAngleDown /> : <FaAngleRight />}
                    </div>
                    <div>
                        <div
                            className={classNames(
                                s.routeName,
                                TransitTypeHelper.getColorClass(this.props.line.transitType)
                            )}
                            onClick={this.openRoute(route.id)}
                        >
                            <div>{route.id}</div>
                            <div>{route.name}</div>
                        </div>
                        <div className={s.routeDate}>
                            {'Muokattu: '}
                            <ReactMoment date={route.date} format='DD.MM.YYYY HH:mm' />
                        </div>
                    </div>
                </div>
                <div className={s.routePaths}>
                    <LineItemSubMenu
                        visible={this.isRouteOpen(route.id)}
                        lineId={this.props.line.id}
                        routeId={route.id}
                    />
                </div>
            </div>
        );
    }

    private redirectToLineView = (lineId: string) => () => {
        const url = RouteBuilder.to(SubSites.line)
            .toTarget(':id', lineId)
            .toLink();
        navigator.goTo(url);
    };

    public render() {
        return (
            <div className={s.lineItemView}>
                <div className={s.lineItem}>
                    <div className={s.icon}>
                        {lineHelper.getTransitIcon(this.props.line.transitType, false)}
                    </div>
                    <div
                        className={classNames(
                            TransitTypeHelper.getColorClass(this.props.line.transitType),
                            s.lineLabel
                        )}
                        onClick={this.redirectToLineView(this.props.line.id)}
                    >
                        {this.props.line.id}
                    </div>
                </div>
                {this.props.line.routes
                    .slice()
                    .sort((a, b) => (a.id < b.id ? -1 : 1))
                    .map(route => this.renderRoute(route))}
            </div>
        );
    }
}

export default LineItem;
