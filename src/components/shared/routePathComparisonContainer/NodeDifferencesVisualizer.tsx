import classnames from 'classnames';
import { isEmpty } from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import NodeType from '~/enums/nodeType';
import StartNodeType from '~/enums/startNodeType';
import { IRoutePath } from '~/models';
import codeListStore from '~/stores/codeListStore';
import { MapStore } from '~/stores/mapStore';
import { RoutePathComparisonStore } from '~/stores/routePathComparisonStore';
import NodeUtils from '~/utils/NodeUtils';
import TransitTypeNodeIcon from '../TransitTypeNodeIcon';
import ComparableRow from './ComparableRow';
import { getRpLinkRows, IComparableRoutePathLink } from './NodeDifferenceVisualizerHelper';
import * as s from './nodeDifferencesVisualizer.scss';

interface INodeDifferencesVisualizerProps {
    routePath1: IRoutePath;
    routePath2: IRoutePath;
    areEqualPropertiesVisible: boolean;
    areCrossroadsVisible: boolean;
    routePathComparisonStore?: RoutePathComparisonStore;
    mapStore?: MapStore;
}

interface IRoutePathLinkRow {
    rpLink1: IComparableRoutePathLink | null;
    rpLink2: IComparableRoutePathLink | null;
    areNodesEqual: boolean;
}

interface INodePropertyRow {
    label: string;
    value1: string;
    value2: string;
}

const NodeDifferencesVisualizer = inject(
    'routePathComparisonStore',
    'mapStore'
)(
    observer((props: INodeDifferencesVisualizerProps) => {
        const { routePath1, routePath2, areEqualPropertiesVisible, areCrossroadsVisible } = props;

        const rpLinkRows: IRoutePathLinkRow[] = getRpLinkRows({ routePath1, routePath2 });
        return (
            <div className={s.nodeDifferencesVisualizer}>
                {rpLinkRows.map((rpLinkRow: IRoutePathLinkRow, index: number) => {
                    const rpLink1 = rpLinkRow.rpLink1;
                    const rpLink2 = rpLinkRow.rpLink2;
                    const areNodesEqual = Boolean(
                        rpLink1 && rpLink2 && rpLink1.startNode.id === rpLink2.startNode.id
                    );
                    if (
                        !areCrossroadsVisible &&
                        areNodesEqual &&
                        rpLink1!.startNode.type === NodeType.CROSSROAD
                    ) {
                        return;
                    }
                    return (
                        <div className={s.nodeRow} key={`nodeRow-${index}`}>
                            {_renderNodeHeader({
                                rpLink1,
                                rpLink2,
                                areNodesEqual,
                                mapStore: props.mapStore,
                            })}
                            {_renderNodeContainers({
                                rpLink1,
                                rpLink2,
                                areNodesEqual,
                                areEqualPropertiesVisible,
                            })}
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
    mapStore,
}: {
    rpLink1: IComparableRoutePathLink | null;
    rpLink2: IComparableRoutePathLink | null;
    areNodesEqual: boolean;
    mapStore?: MapStore;
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
    const _renderIcon = (rpLink: IComparableRoutePathLink) => {
        const node = rpLink.startNode;
        return (
            <div className={s.transitTypeIconWrapper}>
                <TransitTypeNodeIcon
                    nodeType={node.type}
                    transitTypes={node.transitTypes}
                    isTimeAlignmentStop={false}
                    isDisabled={false}
                    isHighlighted={false}
                    highlightColor={'yellow'}
                />
            </div>
        );
    };
    const _centerMapToNode = (rpLink: IComparableRoutePathLink) => {
        const node = rpLink.startNode;
        mapStore!.setCoordinates(node.coordinates);
    };
    if (areNodesEqual) {
        const headerText = _getHeaderText(rpLink1!);
        return (
            <div
                className={classnames(
                    s.headerContainer,
                    s.headerTextCommon,
                    rpLink1!.startNode.type === NodeType.STOP ? s.stopHeader : undefined
                )}
                onClick={() => _centerMapToNode(rpLink1!)}
            >
                {_renderIcon(rpLink1!)}
                {headerText}
            </div>
        );
    }
    return (
        <div className={s.headerContainer}>
            <div
                className={s.headerTextLeft}
                onClick={rpLink1 ? () => _centerMapToNode(rpLink1) : () => void 0}
            >
                {rpLink1 && (
                    <>
                        {_renderIcon(rpLink1)}
                        {_getHeaderText(rpLink1)}
                    </>
                )}
            </div>
            <div
                className={s.headerTextRight}
                onClick={rpLink2 ? () => _centerMapToNode(rpLink2) : () => void 0}
            >
                {rpLink2 && (
                    <>
                        {_renderIcon(rpLink2)}
                        {_getHeaderText(rpLink2)}
                    </>
                )}
            </div>
        </div>
    );
};

const _renderNodeContainers = ({
    rpLink1,
    rpLink2,
    areNodesEqual,
    areEqualPropertiesVisible,
}: {
    rpLink1: IComparableRoutePathLink | null;
    rpLink2: IComparableRoutePathLink | null;
    areNodesEqual: boolean;
    areEqualPropertiesVisible: boolean;
}) => {
    let nodePropertiesList: INodePropertyRow[] = [];
    const _insertValues = ({ label, property }: { label: string; property: string }) => {
        nodePropertiesList = _insertValuesIntoNodePropertiesLists({
            nodePropertiesList,
            areNodesEqual,
            areEqualPropertiesVisible,
            rpLink1,
            rpLink2,
            label,
            property,
        });
    };
    _insertValues({ label: 'Erikoistyyppi', property: 'startNodeUsage' });
    _insertValues({
        label: 'Ajantasauspysäkki',
        property: 'startNodeTimeAlignmentStop',
    });
    _insertValues({
        label: 'Hastus paikka',
        property: 'isStartNodeHastusStop',
    });
    _insertValues({ label: 'Pysäkki käytössä', property: 'startNodeType' });
    _insertValues({
        label: 'Ohitusaika kirja-aikataulussa',
        property: 'isStartNodeUsingBookSchedule',
    });
    _insertValues({
        label: 'Pysäkin sarakenumero kirja-aikataulussa',
        property: 'startNodeBookScheduleColumnNumber',
    });

    return (
        <div className={s.nodeContainers}>
            {nodePropertiesList.map((nodePropertyRow: INodePropertyRow, index: number) => {
                const key = `row-${index}`;

                return areNodesEqual
                    ? _renderComparableRow({ nodePropertyRow, key })
                    : _renderNodeSeparateRow({ nodePropertyRow, key });
            })}
        </div>
    );
};

const rpLinkValueMapperObj = {
    startNodeUsage: (value: string) => codeListStore.getCodeListLabel('Pysäkin käyttö', value),
    startNodeTimeAlignmentStop: (value: string) =>
        codeListStore.getCodeListLabel('Ajantasaus pysakki', value),
    startNodeType: (value: string) => (value === StartNodeType.DISABLED ? 'Ei' : 'Kyllä'),
    isStartNodeHastusStop: (value: string) => (value ? 'Kyllä' : 'Ei'),
};

const _getNodeValue = ({
    rpLink,
    property,
}: {
    rpLink: IComparableRoutePathLink | null;
    property: string;
}): string => {
    if (!rpLink) return '';
    const rawValue = rpLink[property];
    const valueMapper = rpLinkValueMapperObj[property];
    return valueMapper ? valueMapper(rawValue) : rawValue;
};

const _insertValuesIntoNodePropertiesLists = ({
    nodePropertiesList,
    areNodesEqual,
    areEqualPropertiesVisible,
    label,
    property,
    rpLink1,
    rpLink2,
}: {
    nodePropertiesList: INodePropertyRow[];
    areNodesEqual: boolean;
    areEqualPropertiesVisible: boolean;
    label: string;
    property: string;
    rpLink1: IComparableRoutePathLink | null;
    rpLink2: IComparableRoutePathLink | null;
}): INodePropertyRow[] => {
    const value1 =
        rpLink1 && rpLink1.startNode.type === NodeType.STOP
            ? _getNodeValue({ property, rpLink: rpLink1 })
            : '';
    const value2 =
        rpLink2 && rpLink2.startNode.type === NodeType.STOP
            ? _getNodeValue({ property, rpLink: rpLink2 })
            : '';

    if (isEmpty(value1) && isEmpty(value2)) {
        return nodePropertiesList;
    }

    // Equal properties are hidden only from equal nodes
    if (areNodesEqual && !areEqualPropertiesVisible && value1 === value2) {
        return nodePropertiesList;
    }

    nodePropertiesList.push({
        label,
        value1,
        value2,
    });
    return nodePropertiesList;
};

const _renderComparableRow = ({
    nodePropertyRow,
    key,
}: {
    nodePropertyRow: INodePropertyRow;
    key: string;
}) => {
    const { label, value1, value2 } = nodePropertyRow;
    return <ComparableRow key={key} label={label} value1={value1} value2={value2} />;
};

const _renderNodeSeparateRow = ({
    nodePropertyRow,
    key,
}: {
    nodePropertyRow: INodePropertyRow;
    key: string;
}) => {
    const { label, value1, value2 } = nodePropertyRow;
    return (
        <div className={s.separateNodeRow} key={key}>
            <div className={s.alignContentLeft}>
                {!isEmpty(value1) && (
                    <>
                        <div className={s.label}>{label}</div>
                        <div className={s.value}>{value1}</div>
                    </>
                )}
            </div>
            <div className={s.alignContentRight}>
                {!isEmpty(value2) && (
                    <>
                        <div className={s.label}>{label}</div>
                        <div className={s.value}>{value2}</div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NodeDifferencesVisualizer;

export { IRoutePathLinkRow };
