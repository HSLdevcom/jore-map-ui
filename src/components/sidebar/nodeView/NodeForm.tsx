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
import NodeLocationType from '~/types/NodeLocationType';
import NodeUtils from '~/utils/NodeUtils';
import { createDropdownItemsFromList } from '~/utils/dropdownUtils';
import CoordinateInputRow from './CoordinateInputRow';
import * as s from './nodeForm.scss';

interface INodeViewProps {
    node: INode;
    isNewNode: boolean;
    isEditingDisabled: boolean;
    invalidPropertiesMap: object;
    isNodeIdEditable?: boolean;
    nodeIdSuffixOptions?: IDropdownItem[];
    isNodeIdSuffixQueryLoading?: boolean;
    onChangeNodeId?: (value: any) => void;
    onChangeNodeGeometry?: (property: NodeLocationType) => (value: L.LatLng) => void;
    onChangeNodeProperty?: (property: keyof INode) => (value: any) => void;
    onChangeNodeType?: (type: NodeType) => void;
    codeListStore?: CodeListStore;
}

@inject('codeListStore')
@observer
class NodeForm extends Component<INodeViewProps> {
    private createMeasuredDropdownItems = (): IDropdownItem[] => {
        const items: IDropdownItem[] = [
            {
                value: NodeMeasurementType.Calculated,
                label: 'Laskettu'
            },
            {
                value: NodeMeasurementType.Measured,
                label: 'Mitattu'
            }
        ];
        return items;
    };

    render() {
        const {
            node,
            isNewNode,
            isEditingDisabled,
            isNodeIdEditable,
            nodeIdSuffixOptions,
            isNodeIdSuffixQueryLoading,
            onChangeNodeId,
            invalidPropertiesMap,
            onChangeNodeGeometry,
            onChangeNodeProperty,
            onChangeNodeType
        } = this.props;
        const nodeTypeCodeList = createDropdownItemsFromList(['P', 'X']);
        return (
            <div className={classnames(s.nodeForm, s.form)}>
                <div className={s.formSection}>
                    {isNewNode && (
                        <div className={s.flexRow}>
                            <InputContainer
                                value={node.id}
                                onChange={onChangeNodeId ? onChangeNodeId : undefined}
                                label={isNodeIdEditable ? 'SOLMUN TUNNUS (5 num.' : 'SOLMUN TUNNUS'}
                                disabled={!isNodeIdEditable || Boolean(isNodeIdSuffixQueryLoading)}
                                validationResult={invalidPropertiesMap['id']}
                                data-cy='nodeId'
                            />
                            {isNodeIdEditable && (
                                <Dropdown
                                    label='+ 2 num.)'
                                    onChange={
                                        onChangeNodeProperty
                                            ? onChangeNodeProperty('idSuffix')
                                            : undefined
                                    }
                                    disabled={_.isEmpty(nodeIdSuffixOptions)}
                                    isLoading={isNodeIdSuffixQueryLoading}
                                    selected={node.idSuffix}
                                    items={nodeIdSuffixOptions ? nodeIdSuffixOptions : []}
                                    validationResult={invalidPropertiesMap['idSuffix']}
                                    data-cy='idSuffix'
                                />
                            )}
                        </div>
                    )}
                    <div className={s.flexRow}>
                        <Dropdown
                            label='TYYPPI'
                            onChange={onChangeNodeType ? onChangeNodeType : undefined}
                            disabled={isEditingDisabled || !isNewNode}
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
                </div>
                <div className={classnames(s.formSection, s.noBorder)}>
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
                    {node.type === NodeType.STOP && (
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
                    )}
                    {node.type === NodeType.STOP && (
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
                    )}
                </div>
            </div>
        );
    }
}

export default NodeForm;
