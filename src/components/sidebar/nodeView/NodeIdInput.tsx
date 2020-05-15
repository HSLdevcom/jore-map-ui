import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Dropdown, TransitToggleButtonBar } from '~/components/controls';
import InputContainer from '~/components/controls/InputContainer';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import { INode } from '~/models';
import { CodeListStore } from '~/stores/codeListStore';
import { NodeStore } from '~/stores/nodeStore';
import * as s from './nodeForm.scss';

interface INodeIdInputProps {
    node: INode;
    isEditingDisabled: boolean;
    invalidPropertiesMap: object;
    isNodeIdEditable?: boolean;
    onChangeNodeProperty?: (property: keyof INode) => (value: any) => void;
    nodeStore?: NodeStore;
    codeListStore?: CodeListStore;
}

@inject('nodeStore', 'codeListStore')
@observer
class NodeIdInput extends React.Component<INodeIdInputProps> {
    private onChangeNodeId = async (beginningOfNodeId: string) => {
        this.props.onChangeNodeProperty!('beginningOfNodeId')(beginningOfNodeId);

        if (beginningOfNodeId.length === 4) {
            await this.props.nodeStore!.queryNodeIdSuffixes();
        } else {
            this.props.nodeStore!.setNodeIdSuffixOptions([]);
            this.props.onChangeNodeProperty!('idSuffix')(null);
        }
    };

    private toggleSelectedTransitType = async (transitTypeNew: TransitType) => {
        const node = this.props.nodeStore!.node;
        const transitTypeToSelect = node.transitType === transitTypeNew ? null : transitTypeNew;
        this.props.onChangeNodeProperty!('transitType')(transitTypeToSelect);
        if (this.props.isNodeIdEditable) {
            this.props.nodeStore!.setNodeIdSuffixOptions([]);
            this.props.onChangeNodeProperty!('idSuffix')(null);
        }
    };

    // Note: same mapping found from jore-map-backend. If changed, change backend mapping also.
    // Better would be to create an API method that returns mapping for this
    private getNodeIdUsageCode = () => {
        const nodeStore = this.props.nodeStore!;
        const transitType = nodeStore.node.transitType;
        if (nodeStore.node.type !== NodeType.STOP) return '0';
        switch (transitType) {
            case TransitType.BUS:
                return '2';
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

    render() {
        const { node, invalidPropertiesMap, isNodeIdEditable } = this.props;
        const isNodeIdQueryLoading = this.props.nodeStore!.isNodeIdQueryLoading;
        const nodeIdSuffixOptions = this.props.nodeStore!.nodeIdSuffixOptions;
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
                        isLoading={isNodeIdQueryLoading}
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
                                isLoading={isNodeIdQueryLoading}
                                selected={node.idSuffix}
                                items={nodeIdSuffixOptions ? nodeIdSuffixOptions : []}
                                validationResult={invalidPropertiesMap['idSuffix']}
                                data-cy='idSuffix'
                            />
                        </>
                    )}
                </div>
                {node.type === NodeType.STOP && (
                    <div className={s.flexRow}>
                        <div className={s.formItem}>
                            <div className={s.inputLabel}>VERKKO</div>
                            <TransitToggleButtonBar
                                selectedTransitTypes={node.transitType ? [node.transitType!] : []}
                                toggleSelectedTransitType={this.toggleSelectedTransitType}
                                errorMessage={''}
                                disabled={isNodeIdQueryLoading}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    }
}

export default NodeIdInput;
