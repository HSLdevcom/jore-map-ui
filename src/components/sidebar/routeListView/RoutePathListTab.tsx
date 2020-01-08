import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { FiInfo } from 'react-icons/fi';
import { Button } from '~/components/controls';
import { IRoute, IRoutePath } from '~/models';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import { MapStore } from '~/stores/mapStore';
import { RouteListStore } from '~/stores/routeListStore';
import { toDateString } from '~/util/dateHelpers';
import ToggleSwitch from '../../controls/ToggleSwitch';
import * as s from './routePathListTab.scss';

interface IRouteItemProps {
    route: IRoute;
    areAllRoutePathsVisible: boolean;
    toggleAllRoutePathsVisible: () => void;
    routeListStore?: RouteListStore;
    mapStore?: MapStore;
}

const ROUTE_PATH_SHOW_LIMIT = 3;

@inject('routeListStore', 'mapStore')
@observer
class RoutePathListTab extends React.Component<IRouteItemProps> {
    private groupRoutePathsOnDates = (routePaths: IRoutePath[]) => {
        const res = {};
        routePaths.forEach(rp => {
            const identifier = rp.startTime.toLocaleDateString() + rp.endTime.toLocaleDateString();
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
                this.props.routeListStore!.toggleRoutePathVisibility(routePath.internalId);
            };

            const openRoutePathView = () => {
                const routePathViewLink = routeBuilder
                    .to(subSites.routePath)
                    .toTarget(
                        ':id',
                        [
                            routePath.routeId,
                            Moment(routePath.startTime).format('YYYY-MM-DDTHH:mm:ss'),
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
                <div className={s.routePathContainer} key={routePath.internalId}>
                    <div
                        className={
                            isWithinTimeSpan
                                ? classNames(s.routePathInfo, s.highlight)
                                : s.routePathInfo
                        }
                    >
                        <div>{`${routePath.originFi}-${routePath.destinationFi}`}</div>
                    </div>
                    <div className={s.routePathControls}>
                        <ToggleSwitch
                            onClick={toggleRoutePathVisibility}
                            value={routePath.visible}
                            color={routePath.visible ? routePath.color! : '#898989'}
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
        if (routePaths.length === 0) {
            return <div className={s.noRoutePathsMessage}>Reitillä ei ole reitin suuntia.</div>;
        }
        const groupedRoutePaths = this.groupRoutePathsOnDates(routePaths);
        const groupedRoutePathsToDisplay = this.props.areAllRoutePathsVisible
            ? groupedRoutePaths
            : groupedRoutePaths.slice(0, ROUTE_PATH_SHOW_LIMIT);

        return groupedRoutePathsToDisplay.map((routePaths: IRoutePath[], index) => {
            const first = routePaths[0];
            const header = `${toDateString(first.startTime)} - ${toDateString(first.endTime)}`;

            return (
                <div
                    key={header}
                    className={classNames(s.groupedRoutes, index % 2 ? s.shadow : undefined)}
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
            <div className={s.routePathListTab}>
                {this.renderList()}
                {this.props.route.routePaths &&
                    this.props.route.routePaths.length > ROUTE_PATH_SHOW_LIMIT && (
                        <div
                            className={s.toggleAllRoutePathsVisibleButton}
                            onClick={this.props.toggleAllRoutePathsVisible}
                        >
                            {this.props.areAllRoutePathsVisible
                                ? `Piilota reitin suunnat`
                                : `Näytä kaikki reitin suunnat (${
                                      this.props.route.routePaths.length
                                  })`}
                        </div>
                    )}
            </div>
        );
    }
}

export default RoutePathListTab;
