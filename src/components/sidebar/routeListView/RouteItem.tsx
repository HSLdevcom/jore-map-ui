import { inject, observer } from 'mobx-react';
import React from 'react';
import classNames from 'classnames';
import { FiInfo } from 'react-icons/fi';
import Moment from 'moment';
import { RouteListStore } from '~/stores/routeListStore';
import LineHelper from '~/util/lineHelper';
import { dateToDateString } from '~/util/dateFormatHelper';
import TransitTypeHelper from '~/util/TransitTypeHelper';
import routeBuilder from '~/routing/routeBuilder';
import QueryParams from '~/routing/queryParams';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import { IRoutePath, IRoute } from '~/models';
import { Button } from '~/components/controls';
import ToggleSwitch from '../../controls/ToggleSwitch';
import SidebarHeader from '../SidebarHeader';
import * as s from './routeItem.scss';

interface IRouteItemProps {
    routeListStore?: RouteListStore;
    route: IRoute;
}

@inject('routeListStore')
@observer
class RouteItem extends React.Component<IRouteItemProps> {
    async componentDidMount() {
        this.props.route.routePaths.forEach((routePath, index) => {
            // Make two first route paths visible by default
            if (index < 2) {
                this.props.routeListStore!.toggleRoutePathVisibility(
                    routePath.internalId
                );
            }
        });
    }

    private closeRoute = () => {
        this.props.routeListStore!.removeFromRoutes(this.props.route.id);
        const closeRouteLink = routeBuilder
            .to(subSites.current)
            .remove(QueryParams.routes, this.props.route.id)
            .toLink();
        navigator.goTo(closeRouteLink);
    };

    private renderRouteName = () => {
        return (
            <SidebarHeader onCloseButtonClick={this.closeRoute}>
                <div className={s.routeName}>
                    {LineHelper.getTransitIcon(
                        this.props.route.line!.transitType!,
                        false
                    )}
                    <div
                        className={classNames(
                            s.label,
                            TransitTypeHelper.getColorClass(
                                this.props.route.line!.transitType!
                            )
                        )}
                    >
                        <div className={s.routeId} onClick={this.openRouteView}>
                            {this.props.route.id}
                        </div>
                    </div>
                    {this.props.route.routeName}
                </div>
            </SidebarHeader>
        );
    };

    private openRouteView = () => {
        const routeViewLink = routeBuilder
            .to(subSites.route)
            .toTarget(this.props.route.id)
            .clear()
            .toLink();
        navigator.goTo(routeViewLink);
    };

    private groupRoutePathsOnDates = (routePaths: IRoutePath[]) => {
        const res = {};
        routePaths.forEach(rp => {
            const identifier =
                rp.startTime.toLocaleDateString() +
                rp.endTime.toLocaleDateString();
            (res[identifier] = res[identifier] || []).push(rp);
        });

        const list = Object.values(res);
        list.sort(
            (a: IRoutePath[], b: IRoutePath[]) =>
                b[0].startTime.getTime() - a[0].startTime.getTime()
        );

        return list;
    };

    private renderRoutePathList = (routePaths: IRoutePath[]) => {
        return routePaths.map((routePath: IRoutePath) => {
            const toggleRoutePathVisibility = () => {
                this.props.routeListStore!.toggleRoutePathVisibility(
                    routePath.internalId
                );
            };

            const openRoutePathView = () => {
                const routePathViewLink = routeBuilder
                    .to(subSites.routePath)
                    .toTarget(
                        [
                            routePath.routeId,
                            Moment(routePath.startTime).format(
                                'YYYY-MM-DDTHH:mm:ss'
                            ),
                            routePath.direction
                        ].join(',')
                    )
                    .toLink();
                navigator.goTo(routePathViewLink);
            };

            const isWithinTimeSpan =
                Moment(routePath.startTime).isBefore(Moment()) &&
                Moment(routePath.endTime).isAfter(Moment());

            return (
                <div
                    className={s.routePathContainer}
                    key={routePath.internalId}
                >
                    <div
                        className={
                            isWithinTimeSpan
                                ? classNames(s.routePathInfo, s.highlight)
                                : s.routePathInfo
                        }
                    >
                        <div>
                            {`${routePath.originFi}-${routePath.destinationFi}`}
                        </div>
                    </div>
                    <div className={s.routePathControls}>
                        <ToggleSwitch
                            onClick={toggleRoutePathVisibility}
                            value={routePath.visible}
                            color={
                                routePath.visible ? routePath.color! : '#898989'
                            }
                        />
                        <Button
                            className={s.openRoutePathViewButton}
                            hasReverseColor={true}
                            onClick={openRoutePathView}
                        >
                            <FiInfo />
                        </Button>
                    </div>
                </div>
            );
        });
    };

    private renderList = () => {
        const routePaths = this.props.route.routePaths;
        const groupedRoutePaths = this.groupRoutePathsOnDates(routePaths);

        return groupedRoutePaths.map((routePaths: IRoutePath[], index) => {
            const first = routePaths[0];
            const header = `${dateToDateString(
                first.startTime
            )} - ${dateToDateString(first.endTime)}`;

            return (
                <div
                    key={header}
                    className={classNames(
                        s.groupedRoutes,
                        index % 2 ? undefined : s.shadow
                    )}
                >
                    <div className={s.groupedRoutesDate}>{header}</div>
                    <div className={s.groupedRoutesContent}>
                        {this.renderRoutePathList(routePaths)}
                    </div>
                </div>
            );
        });
    };

    render() {
        return (
            <div className={s.routeItemView}>
                {this.renderRouteName()}
                {this.renderList()}
            </div>
        );
    }
}

export default RouteItem;
