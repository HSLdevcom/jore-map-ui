import { inject, observer } from 'mobx-react';
import React from 'react';
import classNames from 'classnames';
import { FiInfo } from 'react-icons/fi';
import Moment from 'moment';
import { RouteStore } from '~/stores/routeStore';
import LineHelper from '~/util/lineHelper';
import { dateToDateString } from '~/util/dateFormatHelper';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import { IRoutePath, IRoute } from '~/models';
import ToggleSwitch from '../../controls/ToggleSwitch';
import ViewHeader from '../ViewHeader';
import * as s from './routeShow.scss';

interface IRouteShowProps {
    routeStore?: RouteStore;
    route: IRoute;
}

@inject('routeStore')
@observer
class RouteShow extends React.Component<IRouteShowProps> {
    async componentDidMount() {
        this.props.route.routePaths.forEach((routePath, index) => {
            // Make two first route paths visible by default
            if (index < 2) {
                this.props.routeStore!.toggleRoutePathVisibility(routePath.internalId);
            }
        });
    }

    private renderRouteName = () => {
        return (
            <ViewHeader>
                <div className={s.routeName}>
                    {LineHelper.getTransitIcon(this.props.route.line!.transitType, false)}
                    <div
                        className={classNames(
                            s.label,
                            TransitTypeColorHelper.getColorClass(
                                this.props.route.line!.transitType),
                        )}
                    >
                        {this.props.route.id}
                    </div>
                    {this.props.route.routeName}
                </div>
            </ViewHeader>
        );
    }

    private groupRoutePathsOnDates = (routePaths: IRoutePath[]) => {
        const res = {};
        routePaths.forEach((rp) => {
            const identifier = rp.startTime.toLocaleDateString() + rp.endTime.toLocaleDateString();
            (res[identifier] = res[identifier] || []).push(rp);
        });

        const list = Object.values(res);
        list.sort((a: IRoutePath[], b: IRoutePath[]) =>
            b[0].startTime.getTime() - a[0].startTime.getTime());

        return list;
    }

    private renderRoutePathList = (routePaths: IRoutePath[]) => {
        return routePaths.map((routePath: IRoutePath) => {
            const toggleRoutePathVisibility = () => {
                this.props.routeStore!.toggleRoutePathVisibility(routePath.internalId);
            };

            const openRoutePathView = () => {
                const routePathViewLink = routeBuilder
                    .to(subSites.routePath)
                    .toTarget([
                            routePath.routeId,
                            Moment(routePath.startTime).format('YYYY-MM-DDTHH:mm:ss'),
                            routePath.direction,
                    ].join(','))
                    .toLink();
                navigator.goTo(routePathViewLink);
            };

            const isWithinTimeSpan = (Moment(routePath.startTime).isBefore(Moment()) &&
                                    Moment(routePath.endTime).isAfter(Moment()));

            return (
                <div
                    className={s.routePathContainer}
                    key={routePath.internalId}
                >
                    <div
                        className={(isWithinTimeSpan) ?
                        classNames(s.routePathInfo, s.highlight) :
                        s.routePathInfo}
                    >
                        <div>
                            {`${routePath.originFi}-${routePath.destinationFi}`}
                        </div>
                    </div>
                    <div className={s.routePathControls}>
                        <ToggleSwitch
                            onClick={toggleRoutePathVisibility}
                            value={routePath.visible}
                            color={routePath.visible ? routePath.color! : '#898989'}
                        />
                        <div
                            className={s.routeInfoButton}
                            onClick={openRoutePathView}
                        >
                            <FiInfo />
                        </div>
                    </div>
                </div>
            );
        });
    }

    private renderList = () => {
        const routePaths = this.props.route.routePaths;
        const groupedRoutePaths = this.groupRoutePathsOnDates(routePaths);

        return groupedRoutePaths.map((routePaths: IRoutePath[], index) => {
            const first = routePaths[0];
            const header =
                `${dateToDateString(first.startTime)} - ${dateToDateString(first.endTime)}`;

            return (
                <div
                    key={header}
                    className={
                        classNames(
                            s.groupedRoutes,
                            index % 2 ? undefined : s.shadow,
                        )
                    }
                >
                    <div className={s.groupedRoutesDate}>
                        {header}
                    </div>
                    <div className={s.groupedRoutesContent}>
                        {this.renderRoutePathList(routePaths)}
                    </div>
                </div>
            );
        });
    }

    render() {
        return (
            <div className={s.routeShowView}>
                {this.renderRouteName()}
                {this.renderList()}
            </div>
        );
    }
}

export default RouteShow;
