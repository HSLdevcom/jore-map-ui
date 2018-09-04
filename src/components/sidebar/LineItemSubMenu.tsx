import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Moment from 'react-moment';
import { IRoutePath, IRoute } from '../../models';
import RouteService from '../../services/routeService';
import { NotificationStore } from '../../stores/notificationStore';
import { SearchStore } from '../../stores/searchStore';
import NotificationType from '../../enums/notificationType';
import { Checkbox } from '../controls';
import * as s from './lineItemSubMenu.scss';

interface LineItemSubMenuProps {
    notificationStore?: NotificationStore;
    searchStore?: SearchStore;
    routeId: string;
    lineId: string;
    visible: boolean;
}

interface LineItemSubMenuState {
    routePaths: IRoutePath[] | null;
}

@inject('notificationStore', 'searchStore')
@observer
class LineItemSubMenu extends Component<LineItemSubMenuProps, LineItemSubMenuState> {
    private mounted: boolean;

    constructor(props: LineItemSubMenuProps) {
        super(props);
        this.state = {
            routePaths: null,
        };
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    public componentDidMount() {
        this.mounted = true;
        this.fetchRoutePaths();
    }

    public componentDidUpdate() {
        this.fetchRoutePaths();
    }

    private fetchRoutePaths() {
        if (!this.props.visible || this.state.routePaths) {
            return;
        }
        RouteService.getRoute(this.props.routeId)
            .then((res: IRoute) => {
                // Allow setState call only if LineItemSubMenu is mounted to the view.
                if (this.mounted) {
                    this.setState({
                        routePaths: res.routePaths,
                    });
                }
            })
            .catch((err: any) => {
                this.props.notificationStore!.addNotification({
                    message: 'Reitinsuuntien haussa tapahtui virhe.',
                    type: NotificationType.ERROR,
                });
            });
    }

    private toggle(routePathId: string) {
        if (this.isSelected(routePathId)) {
            this.unSelect(routePathId);
        } else {
            this.select(routePathId);
        }
    }

    private select(routePathId: string) {
        this.props.searchStore!.addSubLineItem(this.props.routeId, routePathId);
    }

    private unSelect(routePathId: string) {
        this.props.searchStore!.removeSubLineItem(this.props.routeId, routePathId);
    }

    private isSelected(routePathId: string) {
        return this.props.searchStore!.subLineItems.some((subLineItem: {
            routePathId: string;
            routeId: string;
        }) => {
            return subLineItem.routeId === this.props.routeId
                && subLineItem.routePathId === routePathId;
        });
    }

    render () {
        if (!this.props.visible) {
            return null;
        }
        if (this.state.routePaths === null) {
            return (
                <div>Lataa...</div>
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
                                onClick={this.toggle.bind(this, routePath.internalId)}
                                checked={this.isSelected(routePath.internalId)}
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
