import { inject, observer } from 'mobx-react';
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
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
import QueryParams from '~/routing/queryParams';
import { IRoutePath, IRoute } from '~/models';
import ToggleSwitch from '../../controls/ToggleSwitch';
import * as s from './routeShow.scss';

interface IRouteShowProps {
    routeStore?: RouteStore;
    route: IRoute;
}

interface IRouteShowState {
    underCopyRoutePaths: IRoutePathListItem[];
}

interface IRoutePathListItem extends IRoutePath {
    isCopied: boolean;
}

@inject('routeStore')
@observer
class RouteShow extends React.Component<IRouteShowProps, IRouteShowState> {
    constructor(props: IRouteShowProps) {
        super(props);

        this.state = {
            underCopyRoutePaths: [],
        };
    }

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

    private renderRouteName = () => {
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

    private groupRoutePathsOnDates = (routePaths: IRoutePath[]): IRoutePathListItem[][] => {
        const res = {};
        routePaths.forEach((rp) => {
            // tslint:disable-next-line:max-line-length
            const identifier = `${rp.startTime.toLocaleDateString()}-${rp.endTime.toLocaleDateString()}`;
            (res[identifier] =
                res[identifier] || [])
                    .push({ ...rp, copy: false });
        });

        const list = Object.values(res) as IRoutePathListItem[][];
        list.sort((a: IRoutePathListItem[], b: IRoutePathListItem[]) =>
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

    private copy = (routePaths: IRoutePath[]) => () => {
        this.setState({
            underCopyRoutePaths:
                routePaths.map(rp => ({ ...rp, isCopied: true })),
        });
    }

    private removeCopies = () => {
        this.setState({
            underCopyRoutePaths: [],
        });
    }

    private insertUnderCopyRoutePaths = (groupedRoutePaths: IRoutePathListItem[][]) => {
        if (this.state.underCopyRoutePaths.length > 0) {
            const ref = this.state.underCopyRoutePaths[0];
            let index = 0;
            groupedRoutePaths.forEach((rpList: IRoutePathListItem[], i) => {
                if (rpList[0].startTime.getTime() >= ref.startTime.getTime()) {
                    index = i + 1;
                }
            });
            groupedRoutePaths.splice(index, 0, this.state.underCopyRoutePaths);
        }
        return groupedRoutePaths;
    }

    private renderList = () => {
        const routePaths = this.props.route.routePaths;
        let groupedRoutePaths = this.groupRoutePathsOnDates(routePaths);
        groupedRoutePaths = this.insertUnderCopyRoutePaths(groupedRoutePaths);

        return groupedRoutePaths.map((routePaths: IRoutePathListItem[], index) => {
            const first = routePaths[0];
            const header =
                `${dateToDateString(first.startTime)} - ${dateToDateString(first.endTime)}`;

            return (
                <div
                    key={`${header} - ${first.isCopied ? 'copy' : ''}`}
                    className={
                        classNames(
                            s.groupedRoutes,
                            first.isCopied ? s.copyMarker : index % 2 ? s.shadow : undefined,
                        )
                    }
                >
                    <div className={s.groupedRoutesDate}>
                        {header}
                        {
                            this.state.underCopyRoutePaths.length === 0 &&
                            !first.isCopied &&
                            <span
                                onClick={this.copy(routePaths)}
                                className={s.copyButton}
                            >
                                Kopioi
                            </span>
                        }
                        {
                            first.isCopied &&
                            <IoMdClose
                                onClick={this.removeCopies}
                            />
                        }
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
