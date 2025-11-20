import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React, { useState } from 'react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import TransitTypeLink from '~/components/shared/TransitTypeLink';
import Loader from '~/components/shared/loader/Loader';
import { IRoutePathSegment } from '~/models/IRoutePath';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import RoutePathSegmentService from '~/services/routePathSegmentService';
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { isCurrentDateWithinTimeSpan } from '~/utils/dateUtils';
import * as s from './routePathCopySegmentRow.scss';

interface IRoutePathCopySegmentRowProps {
    lineId: string;
    routeId: string;
    copySegments: (rpSegment: IRoutePathSegment) => void;
    routePathCopySegmentStore?: RoutePathCopySegmentStore;
    routePathStore?: RoutePathStore;
}

const RoutePathCopySegmentRow = inject(
    'routePathCopySegmentStore',
    'routePathStore'
)(
    observer((props: IRoutePathCopySegmentRowProps) => {
        const [isExpanded, setIsExpanded] = useState<boolean>();
        const [isLoading, setIsLoading] = useState<boolean>();
        const [routePathSegments, setRoutePathSegments] = useState<IRoutePathSegment[]>([]);

        const expandRow = async () => {
            setIsExpanded(!isExpanded);
            if (routePathSegments.length === 0) {
                setIsLoading(true);
                const transitType = props.routePathStore!.routePath!.transitType!;
                const rpSegments = await RoutePathSegmentService.fetchRoutePathLinkSegment({
                    transitType,
                    startNodeId: props.routePathCopySegmentStore!.startSegmentPoint!.nodeId,
                    endNodeId: props.routePathCopySegmentStore!.endSegmentPoint!.nodeId,
                    routeId: props.routeId,
                });
                rpSegments.sort((a, b) => (Moment(a.startDate) > Moment(b.startDate) ? -1 : 1));
                setRoutePathSegments(rpSegments);
                setIsLoading(false);
            }
        };

        const setHighlightedRpSegment = (rpSegment: IRoutePathSegment | null) => () => {
            props.routePathCopySegmentStore!.setHighlightedRoutePath(rpSegment);
        };

        const openRoutePathInNewTab = (rpSegment: IRoutePathSegment) => () => {
            const routePathLink = routeBuilder
                .to(SubSites.routePath)
                .toTarget(
                    ':id',
                    [
                        rpSegment.routeId,
                        Moment(rpSegment.startDate).format('YYYY-MM-DDTHH:mm:ss'),
                        rpSegment.direction,
                    ].join(',')
                )
                .toLink();
            window.open(routePathLink, '_blank');
        };
        const transitType = props.routePathStore!.routePath!.transitType!;

        return (
            <div className={s.routePathRow}>
                <div
                    onClick={expandRow}
                    className={s.routePathRowHeader}
                    data-cy='rpSegmentRowHeader'
                >
                    <div className={s.transitTypeLinks}>
                        <TransitTypeLink
                            transitType={transitType!}
                            shouldShowTransitTypeIcon={true}
                            text={props.lineId}
                        />
                        <div className={s.lineLinkGreaterThanSign}>&gt;</div>
                        <TransitTypeLink
                            transitType={transitType}
                            shouldShowTransitTypeIcon={false}
                            text={props.routeId}
                        />
                    </div>
                    <div className={s.itemToggle}>
                        {isExpanded && <FaAngleDown />}
                        {!isExpanded && <FaAngleRight />}
                    </div>
                </div>
                {isExpanded &&
                    (isLoading ? (
                        <div className={s.loaderContainer}>
                            <Loader size={'small'} hasNoMargin={true} />
                        </div>
                    ) : (
                        <div>
                            {routePathSegments.map(
                                (rpSegment: IRoutePathSegment, index: number) => {
                                    const shouldHighlightRpSegment = isCurrentDateWithinTimeSpan(
                                        rpSegment.startDate,
                                        rpSegment.endDate
                                    );
                                    return (
                                        <div
                                            key={`routePathSegmentRow-${index}`}
                                            className={classnames(
                                                s.routePathRowContainer,
                                                shouldHighlightRpSegment
                                                    ? s.rpSegmentHighlighted
                                                    : undefined
                                            )}
                                            onMouseEnter={setHighlightedRpSegment(rpSegment)}
                                            onMouseLeave={setHighlightedRpSegment(null)}
                                        >
                                            <div>
                                                <div>
                                                    {rpSegment.routeId} {rpSegment.originFi} -{' '}
                                                    {rpSegment.destinationFi}
                                                </div>
                                                <div className={s.timestampRow}>
                                                    {Moment(rpSegment.startDate).format(
                                                        'DD.MM.YYYY'
                                                    )}{' '}
                                                    -{' '}
                                                    {Moment(rpSegment.endDate).format('DD.MM.YYYY')}
                                                </div>
                                            </div>
                                            <div className={s.icons}>
                                                <div
                                                    className={s.icon}
                                                    title={`Kopioi reitin ${rpSegment.routeId} reitinsuunnan segmentti`}
                                                    onClick={() => props.copySegments(rpSegment)}
                                                    data-cy='copyRoutePathSegmentButton'
                                                >
                                                    <FiCopy />
                                                </div>
                                                <div
                                                    className={s.icon}
                                                    title={`Avaa reitin ${rpSegment.routeId} reitinsuunta uuteen ikkunaan`}
                                                    onClick={openRoutePathInNewTab(rpSegment)}
                                                >
                                                    <FiExternalLink />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    ))}
            </div>
        );
    })
);

export default RoutePathCopySegmentRow;
