import React from 'react';
import classNames from 'classnames';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import ReactMoment from 'react-moment';
import lineHelper from '~/util/lineHelper';
import { ILine, ILineRoute } from '~/models';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import searchStore from '~/stores/searchStore';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import LineItemSubMenu from './LineItemSubMenu';
import * as s from './lineItem.scss';

interface ILineItemState {
    openRouteIds: string[];
}

interface ILineItemProps {
    line: ILine;
}

class LineItem extends React.Component<ILineItemProps, ILineItemState> {
    constructor(props: ILineItemProps) {
        super(props);
        this.state = {
            openRouteIds: [],
        };
    }

    private isRouteOpen(routeId: string) {
        return this.state.openRouteIds.some(id => id === routeId);
    }

    private openRouteMenu(routeId: string) {
        this.setState({
            openRouteIds: this.state.openRouteIds.concat(routeId),
        });
    }

    private closeRouteMenu(routeId: string) {
        this.setState({
            openRouteIds: this.state.openRouteIds.filter(id => id !== routeId),
        });
    }

    private toggleRouteMenu = (routeId: string) => (e: any) => {
        e.stopPropagation();
        if (this.isRouteOpen(routeId)) {
            this.closeRouteMenu(routeId);
        } else {
            this.openRouteMenu(routeId);
        }
    }

    private openRoute = (routeId: string) => () => {
        const openRouteLink = routeBuilder
            .to(subSites.routes)
            .append(QueryParams.routes, routeId)
            .toLink();
        searchStore.setSearchInput('');
        searchStore.removeAllSubLineItems();
        navigator.goTo(openRouteLink);
    }

    public renderRoute(route: ILineRoute): any {
        return (
            <div
                key={route.id}
                className={s.routeItem}
            >
                <div className={s.routeItemHeader}>
                    <div
                        className={s.routePathToggle}
                        onClick={this.toggleRouteMenu(route.id)}
                    >
                        {this.isRouteOpen(route.id) ?
                            <FaAngleDown /> :
                            <FaAngleRight />}
                    </div>
                    <div>
                        <div
                            className={classNames(
                                s.routeName,
                                TransitTypeColorHelper.getColorClass(
                                    this.props.line.transitType),
                            )}
                            onClick={this.openRoute(route.id)}
                        >
                            <div>{route.id}</div>
                            <div>{route.name}</div>
                        </div>
                        <div className={s.routeDate}>
                            {'Muokattu: '}
                            <ReactMoment
                                date={route.date}
                                format='DD.MM.YYYY HH:mm'
                            />
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

    public render() {
        return (
            <div className={s.lineItemView}>
                <div className={s.lineItem}>
                    <div className={s.icon}>
                        {lineHelper.getTransitIcon(this.props.line.transitType, false)}
                    </div>
                    <div
                        className={classNames(
                            TransitTypeColorHelper.getColorClass(this.props.line.transitType),
                            s.label,
                        )}
                    >
                        {this.props.line.id}
                    </div>
                </div>
                {this.props.line.routes
                    .slice().sort((a, b) => a.id < b.id ? -1 : 1)
                    .map(route =>
                    this.renderRoute(route),
                )}
            </div>
        );
    }
}

export default LineItem;
