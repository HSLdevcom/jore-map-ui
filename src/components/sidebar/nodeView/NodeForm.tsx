import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Dropdown, RadioButton, TransitToggleButtonBar } from '~/components/controls';
import { IDropdownItem } from '~/components/controls/Dropdown';
import InputContainer from '~/components/controls/InputContainer';
import TextContainer from '~/components/controls/TextContainer';
import NodeMeasurementType from '~/enums/nodeMeasurementType';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import { INode } from '~/models';
import NodeService from '~/services/nodeService';
import { CodeListStore } from '~/stores/codeListStore';
import { NodeStore } from '~/stores/nodeStore';
import NodeLocationType from '~/types/NodeLocationType';
import NodeUtils from '~/utils/NodeUtils';
import { createDropdownItemsFromList } from '~/utils/dropdownUtils';
import { IValidationResult } from '~/validation/FormValidator';
import CoordinateInputRow from './CoordinateInputRow';
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

interface INodeFormState {
    nodeIdSuffixOptions: IDropdownItem[];
    isNodeIdSuffixQueryLoading: boolean;
    beginningOfNodeIdValidationResult: IValidationResult;
    idSuffixValidationResult: IValidationResult;
}

@inject('nodeStore', 'codeListStore')
@observer
class NodeForm extends Component<INodeFormProps, INodeFormState> {
    state = {
        nodeIdSuffixOptions: [],
        isNodeIdSuffixQueryLoading: false,
        beginningOfNodeIdValidationResult: { isValid: false },
        idSuffixValidationResult: { isValid: false },
    };
    private _isMounted: boolean;
    private _setState = (newState: object) => {
        if (this._isMounted) {
            this.setState(newState);
        }
    };
    componentDidMount() {
        this._isMounted = true;
        if (!this.props.isEditingDisabled && this.props.nodeStore!.node.beginningOfNodeId) {
            this.queryAvailableNodeIdSuffixes();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

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

    private onChangeNodeId = async (beginningOfNodeId: string) => {
        this.props.onChangeNodeProperty!('beginningOfNodeId')(beginningOfNodeId);

        if (beginningOfNodeId.length === 4) {
            await this.queryAvailableNodeIdSuffixes();
        } else {
            this._setState({
                nodeIdSuffixOptions: [],
            });
            this.props.onChangeNodeProperty!('idSuffix')(null);
        }
    };

    private selectTransitType = async (transitType: TransitType) => {
        this._setState({
            nodeIdSuffixOptions: [],
        });
        this.props.onChangeNodeProperty!('transitType')(transitType);
        this.props.onChangeNodeProperty!('idSuffix')(null);
        this.props.onChangeNodeProperty!('isInternal')(false);
        await this.queryAvailableNodeIdSuffixes();
    };

    private queryAvailableNodeIdSuffixes = async () => {
        const nodeStore = this.props.nodeStore!;
        const beginningOfNodeId = nodeStore.node.beginningOfNodeId;
        if (!beginningOfNodeId || beginningOfNodeId.length !== 4) return;

        this._setState({
            isNodeIdSuffixQueryLoading: true,
        });

        const nodeIdUsageCode = this.getNodeIdUsageCode();
        const availableNodeIds = await NodeService.fetchAvailableNodeIdsWithPrefix(
            `${beginningOfNodeId}${nodeIdUsageCode}`
        );

        // slide(-2): get last two letters of a nodeId
        const nodeIdSuffixList = availableNodeIds.map((nodeId: string) => nodeId.slice(-2));

        this._setState({
            nodeIdSuffixOptions: createDropdownItemsFromList(nodeIdSuffixList),
            isNodeIdSuffixQueryLoading: false,
        });
    };

    private getNodeIdUsageCode = () => {
        const nodeStore = this.props.nodeStore!;
        const transitType = nodeStore.node.transitType;
        const isInternal = nodeStore.node.isInternal;
        switch (transitType) {
            case TransitType.BUS:
                if (isInternal) {
                    // Helsinki
                    return '1'; // Hki internal network
                }
                return '2'; // Regional bus network
            case TransitType.TRAM:
                return '4';
            case TransitType.TRAIN:
                return '5';
            case TransitType.SUBWAY:
                return '6';
            case TransitType.FERRY:
                return '7';
            default:
                return '3'; // Default number that is not restricted to any usage
        }
    };

    private onChangeNodeIdSuffix = (idSuffix: string) => {
        const node = this.props.nodeStore!.node;
        const nodeIdUsageCode = this.getNodeIdUsageCode();
        const nodeId = `${node.beginningOfNodeId}${nodeIdUsageCode}${idSuffix}`;
        this.props.onChangeNodeProperty!('id')(nodeId);
        this.props.onChangeNodeProperty!('idSuffix')(idSuffix);
    };

    private onChangeIsInternal = (isInternal: boolean) => async () => {
        this._setState({
            isInternal,
        });
        this.props.onChangeNodeProperty!('isInternal')(isInternal);
        this.props.onChangeNodeProperty!('idSuffix')(null);
        await this.queryAvailableNodeIdSuffixes();
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
        const { nodeIdSuffixOptions, isNodeIdSuffixQueryLoading } = this.state;
        return (
            <div className={classnames(s.nodeForm, s.form)}>
                <div className={s.formSection}>
                    {isNewNode && (
                        <>
                            <div className={s.flexRow}>
                                <InputContainer
                                    value={isNodeIdEditable ? node.beginningOfNodeId : node.id}
                                    onChange={this.onChangeNodeId}
                                    label={
                                        isNodeIdEditable ? 'SOLMUN TUNNUS (4 num.' : 'SOLMUN TUNNUS'
                                    }
                                    disabled={
                                        !isNodeIdEditable || Boolean(isNodeIdSuffixQueryLoading)
                                    }
                                    validationResult={invalidPropertiesMap['beginningOfNodeId']}
                                    data-cy='nodeId'
                                />
                                {isNodeIdEditable && (
                                    <Dropdown
                                        label='+ 2 num.)'
                                        onChange={this.onChangeNodeIdSuffix}
                                        disabled={_.isEmpty(nodeIdSuffixOptions)}
                                        isLoading={isNodeIdSuffixQueryLoading}
                                        selected={node.idSuffix}
                                        items={nodeIdSuffixOptions ? nodeIdSuffixOptions : []}
                                        validationResult={invalidPropertiesMap['idSuffix']}
                                        data-cy='idSuffix'
                                    />
                                )}
                            </div>
                            <div className={s.flexRow}>
                                <div className={s.formItem}>
                                    <div className={s.inputLabel}>VERKKO</div>
                                    <TransitToggleButtonBar
                                        selectedTransitTypes={
                                            node.transitType ? [node.transitType!] : []
                                        }
                                        toggleSelectedTransitType={this.selectTransitType}
                                        errorMessage={''}
                                    />
                                </div>
                            </div>
                            {node.transitType && node.transitType === '1' && (
                                <div className={s.flexRow}>
                                    <div className={s.formItem}>
                                        <RadioButton
                                            onClick={this.onChangeIsInternal(true)}
                                            checked={Boolean(node.isInternal)}
                                            text={'Helsingin sisäinen'}
                                        />
                                    </div>
                                    <div className={s.formItem}>
                                        <RadioButton
                                            onClick={this.onChangeIsInternal(false)}
                                            checked={Boolean(!node.isInternal)}
                                            text={'Helsingin ulkopuolinen'}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
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
