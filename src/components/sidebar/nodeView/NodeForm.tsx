import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Dropdown } from '~/components/controls';
import { IDropdownItem } from '~/components/controls/Dropdown';
import InputContainer from '~/components/controls/InputContainer';
import TextContainer from '~/components/controls/TextContainer';
import NodeMeasurementType from '~/enums/nodeMeasurementType';
import NodeType from '~/enums/nodeType';
import { INode } from '~/models';
import { CodeListStore } from '~/stores/codeListStore';
import { NodeStore } from '~/stores/nodeStore';
import NodeLocationType from '~/types/NodeLocationType';
import NodeUtils from '~/utils/NodeUtils';
import { createDropdownItemsFromList } from '~/utils/dropdownUtils';
import CoordinateInputRow from './CoordinateInputRow';
import NodeIdInput from './NodeIdInput';
import ShortIdInput from './ShortIdInput';
import * as s from './nodeForm.scss';

interface INodeFormProps {
    node: INode;
    isNewNode: boolean;
    isEditingDisabled: boolean;
    invalidPropertiesMap: object;
    isNodeIdEditable?: boolean;
    onChangeNodeGeometry?: (property: NodeLocationType) => (value: L.LatLng) => void;
    onChangeNodeProperty?: (property: keyof INode) => (value: any) => void;
    onChangeNodeType?: (type: NodeType) => void;
    nodeStore?: NodeStore;
    codeListStore?: CodeListStore;
}

// Key: node id beginning, value: short id options array
const SHORT_ID_OPTIONS_MAP = {
    1: ['H', 'XH'],
    2: ['E', 'XE'],
    3: ['Ka'],
    4: ['V', 'XV'],
    5: ['Hy', 'La', 'Ri', 'Vi', 'Ko', 'Or'],
    6: ['Ki', 'Ra'],
    63: ['So'],
    90: ['Ke'],
    91: ['Ke'],
    92: ['Si'],
    93: ['Po'],
    94: ['Pn', 'As'],
    95: ['Jä'],
    96: ['Tu'],
    97: ['Nu'],
    98: ['Mä'],
};

@inject('nodeStore', 'codeListStore')
@observer
class NodeForm extends Component<INodeFormProps> {
    private createMeasuredDropdownItems = (): IDropdownItem[] => {
        const items: IDropdownItem[] = [
            {
                value: NodeMeasurementType.Calculated,
                label: 'Laskettu',
            },
            {
                value: NodeMeasurementType.Measured,
                label: 'Mitattu',
            },
        ];
        return items;
    };

    private getShortIdLetterDropdownItems = (nodeId: string) => {
        const dropdownItems: IDropdownItem[] = [];
        for (const nodeIdBeginning in SHORT_ID_OPTIONS_MAP) {
            if (Object.prototype.hasOwnProperty.call(SHORT_ID_OPTIONS_MAP, nodeIdBeginning)) {
                if (nodeId.startsWith(nodeIdBeginning)) {
                    const nodeIdOptions = SHORT_ID_OPTIONS_MAP[nodeIdBeginning];
                    nodeIdOptions.forEach((nodeIdOption: string) => {
                        const codeListLabel = this.props.codeListStore!.getCodeListLabel(
                            'Lyhyttunnus',
                            nodeIdOption
                        );
                        const dropdownItem = {
                            value: nodeIdOption,
                            label: `${nodeIdOption} - ${codeListLabel}`,
                        };
                        dropdownItems.push(dropdownItem);
                    });
                }
            }
        }
        return dropdownItems;
    };

    private changeNodeType = (nodeType: NodeType) => {
        this.props.onChangeNodeType!(nodeType);
        this.props.onChangeNodeProperty!('idSuffix')(null);
    };

    render() {
        const {
            node,
            isNewNode,
            isEditingDisabled,
            invalidPropertiesMap,
            isNodeIdEditable,
            onChangeNodeGeometry,
            onChangeNodeProperty,
            onChangeNodeType,
        } = this.props;
        const nodeTypeCodeList = createDropdownItemsFromList(['P', 'X']);
        const isNodeIdQueryLoading = this.props.nodeStore!.isNodeIdQueryLoading;
        return (
            <div className={classnames(s.nodeForm, s.form)}>
                <div className={s.formSection}>
                    {isNewNode && (
                        <NodeIdInput
                            node={node}
                            isEditingDisabled={isEditingDisabled}
                            invalidPropertiesMap={invalidPropertiesMap}
                            isNodeIdEditable={isNodeIdEditable}
                            onChangeNodeProperty={onChangeNodeProperty}
                        />
                    )}
                    <div className={s.flexRow}>
                        <Dropdown
                            label='TYYPPI'
                            onChange={onChangeNodeType ? this.changeNodeType : undefined}
                            disabled={isEditingDisabled || !isNewNode || isNodeIdQueryLoading}
                            selected={node.type}
                            items={nodeTypeCodeList}
                            data-cy='nodeTypeDropdown'
                        />
                    </div>
                    {!isNewNode && (
                        <div className={s.flexRow}>
                            <TextContainer label='MUOKANNUT' value={node.modifiedBy} />
                            <TextContainer
                                label='MUOKATTU PVM'
                                value={node.modifiedOn}
                                isTimeIncluded={true}
                            />
                        </div>
                    )}
                    {node.type === NodeType.STOP && (
                        <div className={s.flexRow}>
                            <Dropdown
                                label='LYHYTTUNNUS (2 kirj.'
                                onChange={
                                    onChangeNodeProperty
                                        ? onChangeNodeProperty('shortIdLetter')
                                        : undefined
                                }
                                disabled={isEditingDisabled}
                                selected={node.shortIdLetter}
                                emptyItem={{
                                    value: '',
                                    label: '',
                                }}
                                items={this.getShortIdLetterDropdownItems(node.id)}
                            />
                            <ShortIdInput
                                node={node}
                                isNewNode={isNewNode}
                                isBackgroundGrey={
                                    !isEditingDisabled && !Boolean(node.shortIdLetter)
                                }
                                isEditingDisabled={
                                    isEditingDisabled || !Boolean(node.shortIdLetter)
                                }
                                nodeInvalidPropertiesMap={invalidPropertiesMap}
                                onNodePropertyChange={onChangeNodeProperty}
                            />
                        </div>
                    )}
                </div>
                <div className={s.formSection}>
                    {node.type === NodeType.STOP && (
                        <>
                            <CoordinateInputRow
                                isEditingDisabled={isEditingDisabled}
                                label={
                                    <div className={s.sectionHeader}>
                                        Mitattu piste
                                        <div
                                            className={classnames(
                                                s.labelIcon,
                                                ...NodeUtils.getNodeTypeClasses(node.type, {})
                                            )}
                                        />
                                    </div>
                                }
                                coordinates={node.coordinates}
                                onChange={
                                    onChangeNodeGeometry
                                        ? onChangeNodeGeometry('coordinates')
                                        : () => void 0
                                }
                            />
                            <div className={s.flexRow}>
                                <InputContainer
                                    type='date'
                                    label='MITTAUSPVM'
                                    value={node.measurementDate}
                                    disabled={isEditingDisabled}
                                    onChange={
                                        onChangeNodeProperty
                                            ? onChangeNodeProperty('measurementDate')
                                            : undefined
                                    }
                                    isClearButtonVisibleOnDates={true}
                                    isEmptyDateValueAllowed={true}
                                    validationResult={invalidPropertiesMap['measurementDate']}
                                    data-cy='measurementDate'
                                />
                                <Dropdown
                                    label='MITTAUSTAPA'
                                    disabled={isEditingDisabled}
                                    selected={node.measurementType}
                                    items={this.createMeasuredDropdownItems()}
                                    validationResult={invalidPropertiesMap['measurementType']}
                                    onChange={
                                        onChangeNodeProperty
                                            ? onChangeNodeProperty('measurementType')
                                            : undefined
                                    }
                                    data-cy='measurementType'
                                />
                            </div>
                        </>
                    )}
                    <CoordinateInputRow
                        isEditingDisabled={isEditingDisabled}
                        label={
                            <div className={s.sectionHeader}>
                                Projisoitu piste
                                <div className={classnames(s.labelIcon, s.projected)} />
                            </div>
                        }
                        coordinates={node.coordinatesProjection}
                        onChange={
                            onChangeNodeGeometry
                                ? onChangeNodeGeometry('coordinatesProjection')
                                : () => void 0
                        }
                    />
                </div>
            </div>
        );
    }
}

export default NodeForm;
