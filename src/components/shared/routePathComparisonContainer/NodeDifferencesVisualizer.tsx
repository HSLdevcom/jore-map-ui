import { inject, observer } from 'mobx-react';
import React from 'react';
import { IRoutePath } from '~/models';
import { RoutePathComparisonStore } from '~/stores/routePathComparisonStore';
import { getRpLinkRows, IComparableRoutePathLink } from './NodeDifferenceVisualizerHelper';
import * as s from './nodeDifferencesVisualizer.scss';

interface INodeDifferencesVisualizerProps {
    routePath1: IRoutePath;
    routePath2: IRoutePath;
    routePathComparisonStore?: RoutePathComparisonStore;
}

interface IRoutePathLinkRow {
    rpLink1: IComparableRoutePathLink | null;
    rpLink2: IComparableRoutePathLink | null;
    areNodesEqual: boolean;
}

const NodeDifferencesVisualizer = inject('routePathComparisonStore')(
    observer((props: INodeDifferencesVisualizerProps) => {
        const { routePath1, routePath2 } = props;

        const rpLinkRows: IRoutePathLinkRow[] = getRpLinkRows({ routePath1, routePath2 });
        return (
            <div className={s.nodeDifferencesVisualizer}>
                {rpLinkRows.map((rpLinkRow: IRoutePathLinkRow, index: number) => {
                    return (
                        <div className={s.nodeRow} key={`nodeRow-${index}`}>
                            <div className={s.node}>
                                {rpLinkRow.rpLink1 ? rpLinkRow.rpLink1.startNode.id : '-'}
                            </div>
                            <div className={s.node}>
                                {rpLinkRow.rpLink2 ? rpLinkRow.rpLink2.startNode.id : '-'}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    })
);

export default NodeDifferencesVisualizer;

export { IRoutePathLinkRow };
