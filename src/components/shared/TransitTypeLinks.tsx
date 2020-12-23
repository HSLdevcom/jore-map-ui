import { inject, observer } from 'mobx-react';
import React from 'react';
import TransitTypeLink, { transitTypeLinkSize } from '~/components/shared/TransitTypeLink';
import TransitType from '~/enums/transitType';
import NavigationUtils from '~/utils/NavigationUtils';
import * as s from './transitTypeLinks.scss';

interface ITransitTypeLinks {
    lineId: string;
    routeId: string;
    transitType: TransitType;
    size?: transitTypeLinkSize; // defaults to large
}

const TransitTypeLinks = inject()(
    observer((props: ITransitTypeLinks) => {
        const { lineId, routeId, transitType, size } = props;
        return (
            <div className={s.transitTypeLinks}>
                <TransitTypeLink
                    transitType={TransitType.BUS}
                    shouldShowTransitTypeIcon={true}
                    text={lineId}
                    onClick={() => NavigationUtils.openLineView({ lineId })}
                    hoverText={`Avaa ${lineId}`}
                    size={size}
                />
                <div className={s.lineLinkGreaterThanSign}>&gt;</div>
                <TransitTypeLink
                    transitType={transitType}
                    shouldShowTransitTypeIcon={false}
                    text={routeId}
                    onClick={() =>
                        NavigationUtils.openRouteView({
                            routeId,
                        })
                    }
                    hoverText={`Avaa reitti ${routeId}`}
                    size={size}
                />
            </div>
        );
    })
);

export default TransitTypeLinks;
