import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FaTimes } from 'react-icons/fa';
import classNames from 'classnames';
import { FiInfo } from 'react-icons/fi';
import Moment from 'react-moment';
import { RouteStore } from '~/stores/routeStore';
import LineHelper from '~/util/lineHelper';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import ColorScale from '~/util/colorScale';
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
    visibleRoutePathsIndex: number;
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
                {this.props.route.line!.lineNumber}
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
        let visibleRoutePathsIndex = this.props.visibleRoutePathsIndex;

        return this.props.route.routePaths
        .map((routePath: IRoutePath) => {
            const toggleRoutePathVisibility = () => {
                this.props.routeStore!.toggleRoutePathVisibility(routePath.internalId);
            };
            const routeColor = ColorScale.getColors(
                this.props.routeStore!.visibleRoutePathAmount)[visibleRoutePathsIndex];
            if (routePath.visible) {
                visibleRoutePathsIndex += 1;
            }
            return (
                <div
                    className={s.routePathContainer}
                    key={routePath.internalId}
                >
                    <div className={s.routePathInfo}>
                        <div className={s.routePathTitle}>
                            {`${routePath.originFi}-${routePath.destinationFi}`}
                        </div>
                        <div className={s.flexInnerRow}>
                            <div className={s.routePathDate}>
                                <div className={s.flexColumn}>
                                    {'Alk.pvm:'}
                                    <Moment
                                        date={routePath.startTime}
                                        format='DD.MM.YYYY'
                                    />
                                </div>
                            </div>
                            <div className={s.routePathDate}>
                                <div className={s.flexColumn}>
                                    {'Voim.ast:'}
                                    <Moment
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
