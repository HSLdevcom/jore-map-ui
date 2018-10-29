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
import RouteAndStopHelper from '~/storeAbstractions/routeAndStopAbstraction';
import { IRoutePath, IRoute } from '~/models';
import ToggleSwitch from '../../controls/ToggleSwitch';
import * as s from './routeShow.scss';

interface IRouteShowProps {
    routeStore?: RouteStore;
    route: IRoute;
    colors: string[];
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
        RouteAndStopHelper.removeRoute(this.props.route.routeId);
        const closeRouteLink = routeBuilder
            .to(subSites.current)
            .remove(QueryParams.routes, this.props.route.routeId)
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
                {this.props.route.routeId}
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

            const isWithinTimeSpan = (Moment(routePath.startTime).isBefore(Moment()) &&
                                    Moment(routePath.endTime).isAfter(Moment()));

            const routeColor = this.props.colors[index];
            return (
                <div
                    className={s.routePathContainer}
                    key={routePath.internalId}
                >
                    <div className={s.routePathInfo}>
                        <div
                            className={(isWithinTimeSpan) ?
                            classNames(s.routePathTitle, s.highlight) :
                            s.routePathTitle}
                        >
                            {`${routePath.originFi}-${routePath.destinationFi}`}
                        </div>
                        <div className={s.flexInnerRow}>
                            <div className={s.routePathDate}>
                                <div
                                    className={(isWithinTimeSpan) ?
                                    classNames(s.flexColumn, s.routePathDate, s.highlight) :
                                    classNames(s.flexColumn, s.routePathDate)}
                                >
                                    {'Alk.pvm:'}
                                    <ReactMoment
                                        date={routePath.startTime}
                                        format='DD.MM.YYYY'
                                    />
                                </div>
                            </div>
                            <div className={s.routePathDate}>
                                <div
                                    className={(isWithinTimeSpan) ?
                                    classNames(s.flexColumn, s.routePathDate, s.highlight) :
                                    classNames(s.flexColumn, s.routePathDate)}
                                >
                                    {'Voim.ast:'}
                                    <ReactMoment
                                        date={routePath.endTime}
                                        format='DD.MM.YYYY'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={s.routePathControls}>
                        <ToggleSwitch
                            onClick={toggleRoutePathVisibility}
                            value={routePath.visible}
                            type={this.props.route.line!.transitType}
                            color={routePath.visible ? routeColor : '#898989'}
                        />
                        <div
                            className={s.routeInfoButton}
                            onClick={this.openRoutePathView}
                        >
                            <FiInfo />
                        </div>
                    </div>
                </div>
            );
        });
    }

    private openRoutePathView = () => {
        const routePathViewLink = routeBuilder.to(subSites.routePath).toLink();
        navigator.goTo(routePathViewLink);
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
