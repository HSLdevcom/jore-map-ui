import { inject, observer } from 'mobx-react';
import React from 'react';
import { FiXCircle } from 'react-icons/fi';
import TransitTypeLinks from '~/components/shared/TransitTypeLinks';
import { toDateString } from '~/utils/dateUtils';
import { IRoutePathSelection, RoutePathSelection } from './RoutePathComparisonView';
import * as s from './routePathTabs.scss';

interface IRoutePathTabProps {
    routePath: IRoutePathSelection | null;
    deselectRoutePath: () => void;
}

const RoutePathTab = inject()(
    observer((props: IRoutePathTabProps) => {
        const routePath = props.routePath;

        if (!routePath) {
            return <div className={s.routePathTabWrapper}>Ei valittua reitinsuuntaa.</div>;
        }

        return (
            <div className={s.routePathTabWrapper}>
                <div className={s.transitTypeLinks}>
                    <TransitTypeLinks
                        lineId={routePath.lineId}
                        routeId={routePath.routeId}
                        transitType={routePath.transitType}
                        size={'medium'}
                    />
                    <FiXCircle
                        className={s.deselectRoutePathButton}
                        onClick={props.deselectRoutePath}
                    />
                </div>
                <div className={s.routePathInfo}>
                    Suunta {routePath.direction} {toDateString(routePath.startDate)}
                </div>
            </div>
        );
    })
);

interface ISelectedRoutePathTabsProps {
    routePathSelection1: IRoutePathSelection | null;
    routePathSelection2: IRoutePathSelection | null;
    deselectRoutePath: (routePathSelection: RoutePathSelection) => void;
}

const RoutePathTabs = inject()(
    observer((props: ISelectedRoutePathTabsProps) => {
        return (
            <div className={s.selectedRoutePathTabs}>
                <RoutePathTab
                    routePath={props.routePathSelection1}
                    deselectRoutePath={() =>
                        props.deselectRoutePath(RoutePathSelection.ROUTEPATH_1)
                    }
                />
                <RoutePathTab
                    routePath={props.routePathSelection2}
                    deselectRoutePath={() =>
                        props.deselectRoutePath(RoutePathSelection.ROUTEPATH_2)
                    }
                />
            </div>
        );
    })
);

export default RoutePathTabs;
