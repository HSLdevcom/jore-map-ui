import React, { Component } from 'react';
import * as s from './lineItemSubMenu.scss';
import { IRoutePath, IRoute } from '../../models';
import RouteService from '../../services/routeService';
import { observer, inject } from 'mobx-react';
import { NotificationStore } from '../../stores/notificationStore';
import { SearchStore } from '../../stores/searchStore';
import NotificationType from '../../enums/notificationType';
import { Checkbox } from '../controls';
import Moment from 'react-moment';

interface LineItemSubMenuProps {
    notificationStore?: NotificationStore;
    searchStore?: SearchStore;
    routeId: string;
    lineId: string;
    visible: boolean;
}

interface LineItemSubMenuState {
    routePaths: IRoutePath[] | null;
    selectedIds: string[];
}

@inject('notificationStore', 'searchStore')
@observer
class LineItemSubMenu extends Component<LineItemSubMenuProps, LineItemSubMenuState> {
    private mounted: boolean;

    constructor(props: LineItemSubMenuProps) {
        super(props);
        this.state = {
            routePaths: null,
            selectedIds: [],
        };
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    private fetchRoutePaths() {
        if (!this.props.visible || this.state.routePaths) {
            return;
        }
        RouteService.getRoute(this.props.routeId)
            .then((res: IRoute) => {
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

    private select(routePathId: string) {
        const newSelectedIds = this.state.selectedIds;
        newSelectedIds.push(routePathId);
        this.setState({
            selectedIds: newSelectedIds,
        });
        this.props.searchStore!.addSubLineItem(this.props.routeId, routePathId);
    }

    private unSelect(routePathId: string) {
        this.setState({
            selectedIds: this.state.selectedIds.filter(id => routePathId !== id),
        });
        this.props.searchStore!.removeSubLineItem(this.props.routeId, routePathId);
    }

    private isSelected(routePathId: string) {
        return this.state.selectedIds.some(id => routePathId === id);
    }

    private toggle(routePathId: string) {
        if (this.isSelected(routePathId)) {
            this.unSelect(routePathId);
        } else {
            this.select(routePathId);
        }
    }

    public componentDidMount() {
        this.mounted = true;
        this.fetchRoutePaths();
    }

    public componentDidUpdate() {
        this.fetchRoutePaths();
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
