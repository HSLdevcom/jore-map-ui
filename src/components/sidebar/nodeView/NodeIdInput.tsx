import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Dropdown, RadioButton, TransitToggleButtonBar } from '~/components/controls';
import { IDropdownItem } from '~/components/controls/Dropdown';
import InputContainer from '~/components/controls/InputContainer';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import { INode } from '~/models';
import NodeService from '~/services/nodeService';
import { CodeListStore } from '~/stores/codeListStore';
import { NodeStore } from '~/stores/nodeStore';
import { createDropdownItemsFromList } from '~/utils/dropdownUtils';
import { IValidationResult } from '~/validation/FormValidator';
import * as s from './nodeForm.scss';

interface INodeIdInputProps {
    node: INode;
    isEditingDisabled: boolean;
    invalidPropertiesMap: object;
    isNodeIdEditable?: boolean;
    isNodeIdQueryLoading: boolean;
    onChangeNodeProperty?: (property: keyof INode) => (value: any) => void;
    updateNodeId: ({
        node,
        isInternal,
        transitType,
    }: {
        node: INode;
        isInternal?: boolean;
        transitType?: TransitType | null;
    }) => void;
    nodeStore?: NodeStore;
    codeListStore?: CodeListStore;
}

interface INodeIdInputState {
    nodeIdSuffixOptions: IDropdownItem[];
    isNodeIdSuffixQueryLoading: boolean;
    beginningOfNodeIdValidationResult: IValidationResult;
    idSuffixValidationResult: IValidationResult;
}

@inject('nodeStore', 'codeListStore')
@observer
class NodeIdInput extends React.Component<INodeIdInputProps, INodeIdInputState> {
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

    private toggleSelectedTransitType = async (transitTypeNew: TransitType) => {
        const node = this.props.nodeStore!.node;
        const transitTypeToSelect = node.transitType === transitTypeNew ? null : transitTypeNew;
        if (this.props.isNodeIdEditable) {
            this._setState({
                nodeIdSuffixOptions: [],
            });
            this.props.onChangeNodeProperty!('idSuffix')(null);
            this.props.onChangeNodeProperty!('isInternal')(false);
            await this.queryAvailableNodeIdSuffixes();
        } else {
            this.props.updateNodeId({
                node,
                transitType: transitTypeToSelect,
                isInternal: node.isInternal,
            });
        }
        this.props.onChangeNodeProperty!('transitType')(transitTypeToSelect);
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

    // Note: same mapping found from jore-map-backend. If changed, change backend mapping also.
    // Better would be to create an API method to getUsageCode
    private getNodeIdUsageCode = () => {
        const nodeStore = this.props.nodeStore!;
        const transitType = nodeStore.node.transitType;
        const isInternal = nodeStore.node.isInternal;
        if (nodeStore.node.type !== NodeType.STOP) return '0';
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

        if (this.props.isNodeIdEditable) {
            this.props.onChangeNodeProperty!('idSuffix')(null);
            await this.queryAvailableNodeIdSuffixes();
        } else {
            const node = this.props.nodeStore!.node;
            this.props.updateNodeId({ node, isInternal, transitType: node.transitType });
        }
    };

    render() {
        const { node, invalidPropertiesMap, isNodeIdEditable, isNodeIdQueryLoading } = this.props;
        const { nodeIdSuffixOptions, isNodeIdSuffixQueryLoading } = this.state;
        return (
            <>
                <div className={s.flexRow}>
                    <InputContainer
                        value={isNodeIdEditable ? node.beginningOfNodeId : node.id}
                        onChange={this.onChangeNodeId}
                        label={
                            isNodeIdEditable ? 'SOLMUN TUNNUKSEN ALKU (4 num.)' : 'SOLMUN TUNNUS'
                        }
                        disabled={!isNodeIdEditable}
                        validationResult={invalidPropertiesMap['beginningOfNodeId']}
                        data-cy='nodeId'
                        isLoading={isNodeIdQueryLoading || isNodeIdSuffixQueryLoading}
                    />
                    {isNodeIdEditable && (
                        <>
                            <div className={s.transitTypeUsageCode}>
                                {this.getNodeIdUsageCode()}
                            </div>
                            <Dropdown
                                label='LOPPU (2 num.)'
                                onChange={this.onChangeNodeIdSuffix}
                                disabled={_.isEmpty(nodeIdSuffixOptions)}
                                isLoading={isNodeIdSuffixQueryLoading}
                                selected={node.idSuffix}
                                items={nodeIdSuffixOptions ? nodeIdSuffixOptions : []}
                                validationResult={invalidPropertiesMap['idSuffix']}
                                data-cy='idSuffix'
                            />
                        </>
                    )}
                </div>
                {node.type === NodeType.STOP && (
                    <>
                        <div className={s.flexRow}>
                            <div className={s.formItem}>
                                <div className={s.inputLabel}>VERKKO</div>
                                <TransitToggleButtonBar
                                    selectedTransitTypes={
                                        node.transitType ? [node.transitType!] : []
                                    }
                                    toggleSelectedTransitType={this.toggleSelectedTransitType}
                                    errorMessage={''}
                                />
                            </div>
                        </div>
                        {isNodeIdEditable && node.transitType && node.transitType === '1' && (
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
            </>
        );
    }
}

export default NodeIdInput;
