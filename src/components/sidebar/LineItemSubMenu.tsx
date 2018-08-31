import React, { Component } from 'react';
import * as s from './lineItemSubMenu.scss';
import { IRoutePath, IRoute } from '../../models';
import RouteService from '../../services/routeService';
import { observer, inject } from 'mobx-react';
import { NotificationStore } from '../../stores/notificationStore';
import NotificationType from '../../enums/notificationType';
import { Checkbox } from '../controls';
import Moment from 'react-moment';

interface lineItemSubMenuProps {
    routeId: string;
    lineId: string;
    visible: boolean;
    notificationStore?: NotificationStore;
}

interface lineItemSubMenuState {
    routePaths: IRoutePath[] | null;
    checkedRoutePaths: number[];
}

@inject('notificationStore')
@observer
class LineItemSubMenu extends Component<lineItemSubMenuProps, lineItemSubMenuState> {
    constructor(props: lineItemSubMenuProps) {
        super(props);
        this.state = {
            routePaths: null,
            checkedRoutePaths: [],
        };
    }

    private fetchRoutePaths() {
        RouteService.getRoute(this.props.lineId, this.props.routeId)
            .then((res: IRoute) => {
                this.setState({
                    routePaths: res.routePaths,
                });
            })
            .catch((err: any) => {
                this.props.notificationStore!.addNotification({
                    message: 'Reitinsuuntien haussa tapahtui virhe.',
                    type: NotificationType.ERROR,
                });
            });
    }

    private select(index: number) {
        this.setState({
            checkedRoutePaths: this.state.checkedRoutePaths.concat(index),
        });
    }

    private unSelect(index: number) {
        this.setState({
            checkedRoutePaths: this.state.checkedRoutePaths.filter(path => index !== path),
        });
    }

    private isSelected(index: number) {
        return this.state.checkedRoutePaths.some(path => index === path);
    }

    private toggle(index: number) {
        if (this.isSelected(index)) {
            this.unSelect(index);
        } else {
            this.select(index);
        }
    }

    private fetchRoutePathsIfNecessary() {
        if (this.props.visible && this.state.routePaths == null) {
            this.fetchRoutePaths();
        }
    }

    public componentDidMount() {
        this.fetchRoutePathsIfNecessary();
    }

    public componentDidUpdate() {
        this.fetchRoutePathsIfNecessary();
    }

    render () {
        if (!this.props.visible) {
            return null;
        }
        if (this.state.routePaths === null) {
            return (
                <div>Fetching</div>
            );
        }
        return (
            <div>
                {this.state.routePaths.map((routePath, index) => {
                    return (
                        <div
                            className={s.routePathView}
                            key={index}
                        >
                            <Checkbox
                                onClick={this.toggle.bind(this, index)}
                                checked={this.isSelected(index)}
                                text={routePath.routePathName}
                            />
                            <div className={s.routeDate}>
                                {'Voim.ast: '}
                                <Moment
                                    date={routePath.startTime}
                                    format='DD.MM.YYYY HH:mm'
                                />
                            </div>
                            <div className={s.routeDate}>
                                {'Viim.voim.olo: '}
                                <Moment
                                    date={routePath.endTime}
                                    format='DD.MM.YYYY HH:mm'
                                />
                            </div>
                        </div>
                    );
                })

                }
            </div>
        );
    }
}

export default LineItemSubMenu;
