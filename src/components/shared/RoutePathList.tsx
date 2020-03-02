import classnames from 'classnames';
import Moment from 'moment';
import React from 'react';
import { FiExternalLink } from 'react-icons/fi';
import IRoutePath from '~/models/IRoutePath';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import * as s from './routePathList.scss';

interface IRoutePathListProps {
    topic: string;
    routePaths: IRoutePath[];
    className?: string;
}


class RoutePathList extends React.Component<IRoutePathListProps> {
    private renderRoutePathRow = (routePath: IRoutePath, key: string) => {
        return (
            <div key={key} className={s.routePathRow}>
                {this.renderTextRow(routePath)}
                <div
                    className={s.icon}
                    title={`Avaa reitin ${routePath.routeId} reitinsuunta uuteen ikkunaan`}
                    onClick={this.openRoutePathInNewTab(routePath)}
                >
                    <FiExternalLink />
                </div>
            </div>
        );
    };

    private renderTextRow = (routePath: IRoutePath) => {
        return (
            <div>
                <div>
                    {routePath.routeId} {routePath.originFi} - {routePath.destinationFi}
                </div>
                <div className={s.timestampRow}>
                    {Moment(routePath.startTime).format('DD.MM.YYYY')} -{' '}
                    {Moment(routePath.endTime).format('DD.MM.YYYY')}
                </div>
            </div>
        );
    };

    private openRoutePathInNewTab = (routePath: IRoutePath) => () => {
        const routePathLink = routeBuilder
            .to(SubSites.routePath)
            .toTarget(
                ':id',
                [
                    routePath.routeId,
                    Moment(routePath.startTime).format('YYYY-MM-DDTHH:mm:ss'),
                    routePath.direction
                ].join(',')
            )
            .toLink();
        window.open(routePathLink, '_blank');
    };

    render() {
        const { topic, routePaths: routePath, className } = this.props;
        return (
            <div className={classnames(s.routePathSegmentList, className ? className : undefined)}>
                <div className={s.topic}>{topic}</div>
                { routePath.map((rpSegment, index) => this.renderRoutePathRow(rpSegment, `row-${index}`)) }
                { routePath.length === 0 && (
                    <div>Reitinsuuntia ei löytynyt</div>
                )}
            </div>
        )

}
}

export default RoutePathList;
