import * as React from 'react';
import classNames from 'classnames';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import Moment from 'react-moment';
import lineHelper from '../../util/lineHelper';
import { ILine, ILineRoute } from '../../models';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import searchStore from '../../stores/searchStore';
import LineItemSubMenu from './LineItemSubMenu';
import routeBuilder from '../../routing/routeBuilder';
import subSites from '../../routing/subSites';
import navigator from '../../routing/navigator';
import QueryParams from '../../routing/queryParams';
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
                            {route.name}
                        </div>
                        <div className={s.routeDate}>
                            {'Muokattu: '}
                            <Moment
                                date={route.date}
                                format='DD.MM.YYYY HH:mm'
                            />
                        </div>
                    </div>
                </div>
                <div className={s.routePaths}>
                    <LineItemSubMenu
                        visible={this.isRouteOpen(route.id)}
                        lineId={this.props.line.lineId}
                        routeId={route.id}
                    />
                </div>
            </div>

        );
    }

    public render(): any {
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
                        {this.props.line.lineNumber}
                    </div>
                </div>
                {this.props.line.routes.map(route =>
                    this.renderRoute(route),
                )}
            </div>
        );
    }
}

export default LineItem;
