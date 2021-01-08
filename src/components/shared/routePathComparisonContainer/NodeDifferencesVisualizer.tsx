import { inject, observer } from 'mobx-react';
import React from 'react';
import { INode, IRoutePath } from '~/models';
import { RoutePathComparisonStore } from '~/stores/routePathComparisonStore';
import { getNodeRows } from './NodeDifferenceVisualizerHelper';
import * as s from './nodeDifferencesVisualizer.scss';

interface INodeDifferencesVisualizerProps {
    routePath1: IRoutePath;
    routePath2: IRoutePath;
    routePathComparisonStore?: RoutePathComparisonStore;
}

interface INodeRow {
    node1: INode | null;
    node2: INode | null;
    areNodesEqual: boolean;
}

const NodeDifferencesVisualizer = inject('routePathComparisonStore')(
    observer((props: INodeDifferencesVisualizerProps) => {
        const { routePath1, routePath2 } = props;

        const nodeRows: INodeRow[] = getNodeRows({ routePath1, routePath2 });

        return (
            <div className={s.nodeDifferencesVisualizer}>
                {nodeRows.map((nodeRow: INodeRow, index: number) => {
                    return (
                        <div className={s.nodeRow} key={`nodeRow-${index}`}>
                            <div className={s.node}>{nodeRow.node1 ? nodeRow.node1.id : '-'}</div>
                            <div className={s.node}>{nodeRow.node2 ? nodeRow.node2.id : '-'}</div>
                        </div>
                    );
                })}
            </div>
        );
    })
);

export default NodeDifferencesVisualizer;

export { INodeRow };
