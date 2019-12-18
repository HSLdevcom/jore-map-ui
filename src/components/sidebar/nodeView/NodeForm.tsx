import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Dropdown } from '~/components/controls';
import { IDropdownItem } from '~/components/controls/Dropdown';
import InputContainer from '~/components/controls/InputContainer';
import TextContainer from '~/components/controls/TextContainer';
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
    lngChange?: Function;
    latChange?: Function;
    codeListStore?: CodeListStore;
}

@inject('codeListStore')
@observer
export default class NodeForm extends Component<INodeViewProps> {
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
            onChangeNodeProperty
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
                            onChange={
                                onChangeNodeProperty ? onChangeNodeProperty('type') : undefined
                            }
                            disabled={isEditingDisabled}
                            selected={node.type}
                            items={nodeTypeCodeList}
                        />
                        <Dropdown
                            label='MATKA-AIKAPISTE'
                            disabled={isEditingDisabled}
                            items={this.props.codeListStore!.getDropdownItemList('Kyllä/Ei')}
                            selected={node.tripTimePoint}
                            onChange={
                                onChangeNodeProperty
                                    ? onChangeNodeProperty('tripTimePoint')
                                    : undefined
                            }
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
                            type='number'
                            disabled={isEditingDisabled}
                            validationResult={invalidPropertiesMap['coordinates']}
                        />
                        <InputContainer
                            value={node.coordinates.lng}
                            onChange={lngChange(node.coordinates, 'coordinates')}
                            label='LONGITUDE'
                            type='number'
                            disabled={isEditingDisabled}
                            validationResult={invalidPropertiesMap['coordinates']}
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
                            validationResult={invalidPropertiesMap['measurementDate']}
                        />
                        {node.type === NodeType.STOP && (
                            <TextContainer
                                label='MITTAUSTAPA'
                                value={NodeHelper.getMeasurementTypeLabel(node.measurementType)}
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
