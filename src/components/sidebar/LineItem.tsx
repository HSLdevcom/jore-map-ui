import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classNames from 'classnames';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { NotificationStore } from '../../stores/notificationStore';
import { RouteStore } from '../../stores/routeStore';
import lineHelper from '../../util/lineHelper';
import { LineStore } from '../../stores/lineStore';
import { ILine, IRoute, ILineRoute } from '../../models';
import RouteService from '../../services/routeService';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import Moment from 'react-moment';
import * as s from './lineItem.scss';
import NotificationType from '../../enums/notificationType';
import LineItemSubMenu from './LineItemSubMenu';

interface ILineItemState {
    openRouteIds: string[];
}

interface ILineItemProps {
    notificationStore?: NotificationStore;
    lineStore?: LineStore;
    routeStore?: RouteStore;
    line: ILine;
}

@inject('notificationStore')
@inject('lineStore')
@inject('routeStore')
@observer
class LineItem extends React.Component<ILineItemProps, ILineItemState> {
    constructor(props: ILineItemProps) {
        super(props);
        this.state = {
            openRouteIds: [],
        };
    }

    private selectRoute(routeId: string, e: any) {
        RouteService.getRoute(this.props.line.lineId, routeId)
            .then((res: IRoute) => {
                this.props.routeStore!.addToRoutes(res);
                this.props.lineStore!.setSearchInput('');
            })
            .catch((err: any) => {
                this.props.notificationStore!.addNotification({
                    message: 'Reitin haussa tapahtui virhe.',
                    type: NotificationType.ERROR,
                });
            });
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

    private toggleRouteMenu(routeId: string, e: any) {
        e.stopPropagation();
        if (this.isRouteOpen(routeId)) {
            this.closeRouteMenu(routeId);
        } else {
            this.openRouteMenu(routeId);
        }
    }

    private renderRoute(route: ILineRoute) {
        return (
            <div
                key={route.id}
                className={s.routeItem}
            >
                <div className={s.routeItemHeader}>
                    <div
                        className={s.routePathToggle}
                        onClick={this.toggleRouteMenu.bind(this, route.id)}
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
                            onClick={this.selectRoute.bind(this, route.id)}
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
            <div className={s.listItemView}>
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
                {this.props.line.routes.map((route) => {
                    return (
                        this.renderRoute(route)
                    );
                })}
            </div>
        );
    }
}

export default LineItem;
