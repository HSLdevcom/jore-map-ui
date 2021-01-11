import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import NodeType from '~/enums/nodeType';
import { IRoutePath } from '~/models';
import codeListStore from '~/stores/codeListStore';
import { RoutePathComparisonStore } from '~/stores/routePathComparisonStore';
import NodeUtils from '~/utils/NodeUtils';
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
                    const rpLink1 = rpLinkRow.rpLink1;
                    const rpLink2 = rpLinkRow.rpLink2;
                    const areNodesEqual = Boolean(
                        rpLink1 && rpLink2 && rpLink1.startNode.id === rpLink2.startNode.id
                    );
                    return (
                        <div className={s.nodeRow} key={`nodeRow-${index}`}>
                            {_renderNodeHeader({ rpLink1, rpLink2, areNodesEqual })}
                            <div className={s.nodeContainers}>
                                {_renderLeftNodeContainer({
                                    areNodesEqual,
                                    rpLink: rpLink1,
                                })}
                                {_renderRightNodeContainer({
                                    areNodesEqual,
                                    rpLink: rpLink2,
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    })
);

const _renderNodeHeader = ({
    rpLink1,
    rpLink2,
    areNodesEqual,
}: {
    rpLink1: IComparableRoutePathLink | null;
    rpLink2: IComparableRoutePathLink | null;
    areNodesEqual: boolean;
}) => {
    const _getHeaderText = (rpLink: IComparableRoutePathLink) => {
        const node = rpLink.startNode;
        const stopName = node.stop ? node.stop.nameFi : '';
        const nodeTypeName = NodeUtils.getNodeTypeName(node.type);
        let header = node.type === NodeType.STOP ? stopName : nodeTypeName;
        header += ` ${node.id}`;
        header += ` ${node.shortIdLetter}`;
        header += `${node.shortIdString}`;
        return header;
    };
    if (areNodesEqual) {
        const headerText = _getHeaderText(rpLink1!);
        return (
            <div className={classnames(s.headerContainer, s.headerTextCommon)}>{headerText}</div>
        );
    }
    const headerTextLeft = rpLink1 ? _getHeaderText(rpLink1) : '';
    const headerTextRight = rpLink2 ? _getHeaderText(rpLink2) : '';
    return (
        <div className={s.headerContainer}>
            <div className={s.headerTextLeft}>{headerTextLeft}</div>
            <div className={s.headerTextRight}>{headerTextRight}</div>
        </div>
    );
};

const _renderLeftNodeContainer = ({
    rpLink,
    areNodesEqual,
}: {
    rpLink: IComparableRoutePathLink | null;
    areNodesEqual: boolean;
}) => {
    return _renderNodeContainer({
        rpLink,
        areNodesEqual,
        className: classnames(areNodesEqual ? s.alignContentLeft : s.alignContentRight),
    });
};

const _renderRightNodeContainer = ({
    rpLink,
    areNodesEqual,
}: {
    rpLink: IComparableRoutePathLink | null;
    areNodesEqual: boolean;
}) => {
    return _renderNodeContainer({
        rpLink,
        areNodesEqual,
        className: classnames(areNodesEqual ? s.alignContentRight : s.alignContentLeft),
    });
};

// TODO: _renderNodeSeparateRow // _renderNodeComparableRow
const _renderNodeContainer = ({
    rpLink,
    areNodesEqual,
    className,
}: {
    rpLink: IComparableRoutePathLink | null;
    areNodesEqual: Boolean;
    className: string;
}) => {
    return (
        <div className={classnames(s.nodeContainer, className)}>
            <div className={s.propertiesContainer}>
                {rpLink && (
                    <>
                        {_renderNodeProperty({
                            label: 'Erikoistyyppi',
                            value: rpLink.startNodeUsage,
                            funcName: 'startNodeUsage',
                        })}
                        {_renderNodeProperty({
                            label: 'Ajantasauspysäkki',
                            value: rpLink.startNodeTimeAlignmentStop,
                        })}
                        {_renderNodeProperty({
                            label: 'Hastus paikka',
                            value: rpLink.isStartNodeHastusStop,
                        })}
                        {_renderNodeProperty({
                            label: 'Pysäkki ei käytössä',
                            value: rpLink.startNodeType,
                        })}
                        {_renderNodeProperty({
                            label: 'Ohitusaika kirja-aikataulussa',
                            value: rpLink.isStartNodeUsingBookSchedule,
                        })}
                        {_renderNodeProperty({
                            label: 'Pysäkin sarakenumero kirja-aikataulussa',
                            value: rpLink.startNodeBookScheduleColumnNumber,
                        })}
                    </>
                )}
            </div>
        </div>
    );
};

const getRpLinkValuesObj = {
    startNodeUsage: (value: string) => codeListStore.getCodeListLabel('Pysäkin käyttö', value),
};

const _renderNodeProperty = ({
    label,
    value,
    funcName,
}: {
    label: string;
    value: any;
    funcName?: string;
}) => {
    const _value = funcName ? getRpLinkValuesObj[funcName](value) : value;
    return (
        <div className={s.nodeProperty}>
            {label} {_value}
        </div>
    );
};

export default NodeDifferencesVisualizer;

export { IRoutePathLinkRow };
