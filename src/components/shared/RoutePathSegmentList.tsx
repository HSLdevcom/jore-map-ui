import classnames from 'classnames';
import Moment from 'moment';
import React from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { IRoutePathSegment } from '~/models/IRoutePath';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import * as s from './routePathSegmentList.scss';

interface IRoutePathSegmentListProps {
    topic: string;
    routePathSegments: IRoutePathSegment[];
    className?: string;
}


class RoutePathSegmentList extends React.Component<IRoutePathSegmentListProps> {
    private renderRoutePathSegmentRow = (routePathSegment: IRoutePathSegment, key: string) => {
        return (
            <div key={key} className={s.routePathRow}>
                {this.renderTextRow(routePathSegment)}
                <div
                    className={s.icon}
                    title={`Avaa reitin ${routePathSegment.routeId} reitinsuunta uuteen ikkunaan`}
                    onClick={this.openRoutePathInNewTab(routePathSegment)}
                >
                    <FiExternalLink />
                </div>
            </div>
        );
    };

    private renderTextRow = (routePathSegment: IRoutePathSegment) => {
        return (
            <div>
                <div>
                    {routePathSegment.routeId} {routePathSegment.originFi} - {routePathSegment.destinationFi}
                </div>
                <div className={s.timestampRow}>
                    {Moment(routePathSegment.startTime).format('DD.MM.YYYY')} -{' '}
                    {Moment(routePathSegment.endTime).format('DD.MM.YYYY')}
                </div>
            </div>
        );
    };

    private openRoutePathInNewTab = (routePathSegment: IRoutePathSegment) => () => {
        const routePathLink = routeBuilder
            .to(SubSites.routePath)
            .toTarget(
                ':id',
                [
                    routePathSegment.routeId,
                    Moment(routePathSegment.startTime).format('YYYY-MM-DDTHH:mm:ss'),
                    routePathSegment.direction
                ].join(',')
            )
            .toLink();
        window.open(routePathLink, '_blank');
    };

    render() {
        const { topic, routePathSegments, className } = this.props;
        return (
            <div className={classnames(s.routePathSegmentList, className ? className : undefined)}>
                <div className={s.topic}>{topic}</div>
                { routePathSegments.map((rpSegment, index) => this.renderRoutePathSegmentRow(rpSegment, `row-${index}`)) }
                { routePathSegments.length === 0 && (
                    <div>Reitinsuuntia ei löytynyt</div>
                )}
            </div>
        )

}
}

export default RoutePathSegmentList;
