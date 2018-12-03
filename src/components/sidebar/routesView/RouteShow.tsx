import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FaTimes } from 'react-icons/fa';
import classNames from 'classnames';
import { FiInfo } from 'react-icons/fi';
import ReactMoment from 'react-moment';
import Moment from 'moment';
import { RouteStore } from '~/stores/routeStore';
import LineHelper from '~/util/lineHelper';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import { IRoutePath, IRoute } from '~/models';
import ToggleSwitch from '../../controls/ToggleSwitch';
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

    private closeRoute = () => {
        // TODO: Move actual logic somwhere else, so this function only navigates to new url
        this.props.routeStore!.removeFromRoutes(this.props.route.id);
        const closeRouteLink = routeBuilder
            .to(subSites.current)
            .remove(QueryParams.routes, this.props.route.id)
            .toLink();
        navigator.goTo(closeRouteLink);
    }

    private renderRouteName() {
        return (
        <div className={s.routeName}>
            {LineHelper.getTransitIcon(this.props.route.line!.transitType, false)}
            <div
                className={classNames(
                    s.label,
                    TransitTypeColorHelper.getColorClass(this.props.route.line!.transitType),
                )}
            >
                {this.props.route.id}
            </div>
            {this.props.route.routeName}
            <div
                onClick={this.closeRoute}
                className={s.closeView}
            >
                <FaTimes className={s.close}/>
            </div>
        </div>
        );
    }

    private renderRoutePaths() {
        const routePaths = this.props.route.routePaths;

        return routePaths.map((routePath: IRoutePath, index) => {
            const toggleRoutePathVisibility = () => {
                this.props.routeStore!.toggleRoutePathVisibility(routePath.internalId);
            };

            const openRoutePathView = () => {
                const routePathViewLink = routeBuilder
                    .to(subSites.routePath)
                    .set(
                        QueryParams.startTime,
                        encodeURIComponent(Moment(routePath.startTime).format()))
                    .set(QueryParams.routeId, routePath.routeId)
                    .set(QueryParams.direction, routePath.direction)
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
                        <div>
                            <div className={s.routePathDate}>
                                <ReactMoment
                                    date={routePath.startTime}
                                    format='DD.MM.YYYY'
                                />
                                <div className={s.dateDeltaSeparator}>
                                    -
                                </div>
                                <ReactMoment
                                    date={routePath.endTime}
                                    format='DD.MM.YYYY'
                                />
                            </div>
                        </div>
                    </div>
                    <div className={s.routePathControls}>
                        <ToggleSwitch
                            onClick={toggleRoutePathVisibility}
                            value={routePath.visible}
                            type={this.props.route.line!.transitType}
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

    public render(): any {
        return (
            <div className={s.routeShowView}>
                {this.renderRouteName()}
                {this.renderRoutePaths()}
            </div>
        );
    }
}

export default RouteShow;
