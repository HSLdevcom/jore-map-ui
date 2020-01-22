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
import StartNodeType from '~/enums/startNodeType';
import { INode } from '~/models';
import { CodeListStore } from '~/stores/codeListStore';
import NodeHelper from '~/util/NodeHelper';
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
    onChangeNodeProperty?: (property: keyof INode) => (value: any) => void;
    onChangeNodeType?: (type: NodeType) => void;
    lngChange?: Function;
    latChange?: Function;
    codeListStore?: CodeListStore;
}

@inject('codeListStore')
@observer
export default class NodeForm extends Component<INodeViewProps> {
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
            onChangeNodeProperty,
            onChangeNodeType
        } = this.props;
        const lngChange = this.props.lngChange ? this.props.lngChange : () => void 0;
        const latChange = this.props.latChange ? this.props.latChange : () => void 0;
        const nodeTypeCodeList = this.props
            .codeListStore!.getDropdownItemList('Solmutyyppi (P/E)')
            .filter(item => item.value !== StartNodeType.DISABLED);

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
                                />
                            )}
                        </div>
                    )}
                    <div className={s.flexRow}>
                        <Dropdown
                            label='TYYPPI'
                            onChange={onChangeNodeType ? onChangeNodeType : undefined}
                            disabled={isEditingDisabled}
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
                    <div className={s.sectionHeader}>
                        Mitattu piste
                        <div
                            className={classnames(
                                s.labelIcon,
                                NodeHelper.getNodeTypeClass(node.type, {
                                    isNodeHighlighted: true
                                })
                            )}
                        />
                    </div>
                    <div className={s.flexRow}>
                        <InputContainer
                            value={node.coordinates.lat}
                            onChange={latChange(node.coordinates, 'coordinates')}
                            label='LATITUDE'
                            disabled={isEditingDisabled}
                            validationResult={invalidPropertiesMap['coordinates']}
                        />
                        <InputContainer
                            value={node.coordinates.lng}
                            onChange={lngChange(node.coordinates, 'coordinates')}
                            label='LONGITUDE'
                            disabled={isEditingDisabled}
                            validationResult={invalidPropertiesMap['coordinates']}
                            data-cy='longitudeInput'
                        />
                    </div>
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
                        />
                        {node.type === NodeType.STOP && (
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
                            />
                        )}
                    </div>
                    {node.type === NodeType.STOP && (
                        <>
                            <div className={s.sectionHeader}>
                                Projisoitu piste
                                <div className={classnames(s.labelIcon, s.projected)} />
                            </div>
                            <div className={s.flexRow}>
                                <InputContainer
                                    value={node.coordinatesProjection.lat}
                                    onChange={latChange(
                                        node.coordinatesProjection,
                                        'coordinatesProjection'
                                    )}
                                    label='LATITUDE'
                                    type='number'
                                    disabled={isEditingDisabled}
                                    validationResult={invalidPropertiesMap['coordinatesProjection']}
                                />
                                <InputContainer
                                    value={node.coordinatesProjection.lng}
                                    onChange={lngChange(
                                        node.coordinatesProjection,
                                        'coordinatesProjection'
                                    )}
                                    label='LONGITUDE'
                                    type='number'
                                    disabled={isEditingDisabled}
                                    validationResult={invalidPropertiesMap['coordinatesProjection']}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }
}
