import { inject, observer } from 'mobx-react';
import * as React from 'react';
import classNames from 'classnames';
import CheckBox from '../controls/Checkbox';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { NotificationStore } from '../../stores/notificationStore';
import { RouteStore } from '../../stores/routeStore';
import lineHelper from '../../util/lineHelper';
import { LineStore } from '../../stores/lineStore';
import { ILine, IRoute, IRoutePath } from '../../models';
import RouteService from '../../services/routeService';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import Moment from 'react-moment';
import * as s from './lineItem.scss';
import NotificationType from '../../enums/notificationType';

interface ILineItemState {
    type: string;
    routePaths: IRoutePath[] | null;
    routePathsSelected: number[];
    routeSelectedIndex: number | null;
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
            type: '',
            routePaths: null,
            routePathsSelected: [],
            routeSelectedIndex: null,
        };
    }

    private selectRoute(routeId: string, e: any) {
        e.stopPropagation();
        RouteService.getRoute(this.props.line.lineId, routeId)
            .then((res: IRoute) => {
                this.props.routeStore!.addToRoutes(res);
                this.props.lineStore!.setSearchInput('');
            })
            .catch((err: any) => {
                this.props.notificationStore!.addNotification({
                    message: err,
                    type: NotificationType.ERROR,
                });
            });
    }

    private showPaths(routeId: string, routeSelectedIndex: number, e: any) {
        e.stopPropagation();
        this.props.routeStore!.clearRoutePaths();
        if (this.state.routeSelectedIndex === routeSelectedIndex) {
            const routePaths: IRoutePath[] = [];
            this.setState({
                routePaths,
                routeSelectedIndex: null,
            });
            return;
        }
        RouteService.getRoute(this.props.line.lineId, routeId)
            .then((res: IRoute) => {
                res.routePaths.forEach((routePath: IRoutePath) => {
                    this.props.routeStore!.addToRoutePaths(routePath);
                    const routePaths = this.props.routeStore!.routePaths;
                    this.setState({
                        routePaths,
                        routeSelectedIndex,
                    });
                });
            })
            .catch((err: any) => {
            });
    }

    private routePathSelected(index: number) {
        const routePathsSelected = this.state.routePathsSelected;
        const indexInSelectedRoutePaths = routePathsSelected.indexOf(index);
        if (indexInSelectedRoutePaths === -1) {
            routePathsSelected.push(index);
        } else {
            routePathsSelected.splice(indexInSelectedRoutePaths, 1);
        }
        this.setState({
            routePathsSelected,
        });
    }

    private isRoutePathChecked = (index: number) => {
        return (this.state.routePathsSelected.includes(index));
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
                {this.props.line.routes.map((route, index) => {
                    return (
                        <div
                            key={route.name + '-' + index}
                            className={s.routeItem}
                        >
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
                            {
                                this.state.routeSelectedIndex === index &&
                                this.state.routePaths &&
                                this.state.routePaths.map((route, index) => {
                                    return (
                                        <div
                                            className={s.routePathView}
                                            key={index}
                                        >
                                            <CheckBox
                                                onClick={this.routePathSelected.bind(this, index)}
                                                checked={this.isRoutePathChecked(index)}
                                                text={route.routePathName}
                                            />
                                            <div className={s.routeDate}>
                                                {'Voim.ast: '}
                                                <Moment
                                                    date={route.startTime}
                                                    format='DD.MM.YYYY HH:mm'
                                                />
                                            </div>
                                            <div className={s.routeDate}>
                                                {'Viim.voim.olo: '}
                                                <Moment
                                                    date={route.endTime}
                                                    format='DD.MM.YYYY HH:mm'
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            }
                            <div
                                className={s.routePathToggle}
                                onClick={this.showPaths.bind(this, route.id, index)}
                            >
                                {(this.state.routeSelectedIndex === index) ?
                                    <FaAngleUp /> :
                                    <FaAngleDown />}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default LineItem;
