import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import { INode } from '~/models';
import { DialogStore } from '~/stores/dialogStore';
import { NodeStore } from '~/stores/nodeStore';
import { MapStore } from '~/stores/mapStore';
import stopValidatorModel from '~/validation/models/stopValidatorModel';
import LinkService from '~/services/linkService';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import { Button, Dropdown } from '~/components/controls';
import NodeLocationType from '~/types/NodeLocationType';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import NodeType from '~/enums/nodeType';
import { ErrorStore } from '~/stores/errorStore';
import NodeService from '~/services/nodeService';
import nodeTypeCodeList from '~/codeLists/nodeTypeCodeList';
import ButtonType from '~/enums/buttonType';
import Loader from '~/components/shared/loader/Loader';
import NodeCoordinatesListView from './NodeCoordinatesListView';
import SidebarHeader from '../SidebarHeader';
import StopForm from './StopForm';
import InputContainer from '../InputContainer';
import * as s from './nodeView.scss';

interface INodeViewProps {
    isNewNode: boolean;
    match?: match<any>;
    dialogStore?: DialogStore;
    nodeStore?: NodeStore;
    mapStore?: MapStore;
    errorStore?: ErrorStore;
}

interface INodeViewState {
    isLoading: boolean;
    isEditingDisabled: boolean;
    invalidPropertiesMap: object;
}

@inject('dialogStore', 'nodeStore', 'mapStore', 'errorStore')
@observer
class NodeView extends ViewFormBase<INodeViewProps, INodeViewState> {
    constructor(props: INodeViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            isEditingDisabled: !props.isNewNode,
            invalidPropertiesMap: {},
        };
    }

    componentDidMount() {
        const selectedNodeId = this.props.match!.params.id;

        if (selectedNodeId) {
            this.initExistingNode(selectedNodeId);
        } else {
            const node = this.props.nodeStore!.node;
            this._validateAllProperties(node.type);
        }
    }

    componentWillUnmount() {
        this.props.nodeStore!.clear();
        this.props.mapStore!.setSelectedNodeId(null);
    }

    private initExistingNode = async (selectedNodeId: string) => {
        this.setState({ isLoading: true });
        this.props.mapStore!.setSelectedNodeId(selectedNodeId);

        const node = await this.fetchNode(selectedNodeId);
        if (node) {
            const links = await this.fetchLinksForNode(node);
            if (links) {
                this.props.nodeStore!.init(node, links);
            }
            this._validateAllProperties(node.type);
        }
        this.setState({ isLoading: false });
    }

    private async fetchNode(nodeId: string) {
        try {
            return await NodeService.fetchNode(nodeId);
        } catch (ex) {
            this.props.errorStore!.addError('Solmun haku ei onnistunut');
            return null;
        }
    }

    private async fetchLinksForNode(node: INode) {
        try {
            return await LinkService.fetchLinksWithStartNodeOrEndNode(node.id);
        } catch (ex) {
            this.props.errorStore!.addError(
                // tslint:disable-next-line:max-line-length
                `Haku löytää linkkejä, joilla lnkalkusolmu tai lnkloppusolmu on ${node.id} (soltunnus), ei onnistunut.`,
            );
            return null;
        }
    }

    private save = async () => {
        this.setState({ isLoading: true });
        let preventSetState = false;
        try {
            if (this.props.isNewNode) {
                await NodeService.createNode(this.props.nodeStore!.node);
                preventSetState = true;

                // TODO: remove this, should redirect to node/id instead
                navigator.goTo(SubSites.home);
            } else {
                await NodeService.updateNode(
                    this.props.nodeStore!.node,
                    this.props.nodeStore!.dirtyLinks,
                );
            }

            this.props.nodeStore!.setCurrentStateAsOld();
            this.props.dialogStore!.setFadeMessage('Tallennettu!');
        } catch (err) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, err);
        }

        if (preventSetState) return;
        this.setState({ isLoading: false });
    }

    private toggleIsEditingEnabled = () => {
        this.toggleIsEditingDisabled(
            this.props.nodeStore!.resetChanges,
        );
    }

    private _validateAllProperties = (nodeType: NodeType) => {
        const node = this.props.nodeStore!.node;
        if (nodeType === NodeType.STOP) {
            this.validateAllProperties(stopValidatorModel, node.stop);
        } else {
            this.validateAllProperties({}, node);
        }
    }

    private onNodeGeometryChange = (property: NodeLocationType) => (value: any) => {
        this.props.nodeStore!.updateNodeGeometry(property, value);
        // TODO: add nodeValidationModel. Move stop's invalidPropertiesMap into stopFrom?
        this.validateProperty('', property, value);
    }

    private onNodePropertiesChange = (property: string) => (value: any) => {
        this.props.nodeStore!.updateNode(property, value);
        // TODO: add nodeValidationModel. Move stop's invalidPropertiesMap into stopFrom?
        this.validateProperty('', property, value);
        if (property === 'type') {
            this._validateAllProperties(value);
        }
    }

    private onStopPropertiesChange = (property: string) => (value: any) => {
        this.props.nodeStore!.updateStop(property, value);
        this.validateProperty(stopValidatorModel[property], property, value);
    }

    render() {
        const node = this.props.nodeStore!.node;
        const isEditingDisabled = this.state.isEditingDisabled;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;

        const isSaveButtonDisabled = this.state.isEditingDisabled
            || !this.props.nodeStore!.isDirty
            || !this.isFormValid();

        if (this.state.isLoading) {
            return(
                <div className={classnames(s.nodeView, s.loaderContainer)}>
                    <Loader/>
                </div>
            );
        }
        // TODO: show some indicator to user of an empty page
        if (!node) return null;

        return (
            <div className={s.nodeView}>
                <div className={s.content}>
                    <SidebarHeader
                        isEditButtonVisible={!this.props.isNewNode}
                        shouldShowClosePromptMessage={this.props.nodeStore!.isDirty}
                        isEditing={!isEditingDisabled}
                        onEditButtonClick={this.toggleIsEditingEnabled}
                    >
                        Solmu {node.id}
                    </SidebarHeader>
                    <div className={s.form}>
                        <div className={s.formSection}>
                            <div className={s.flexRow}>
                                <InputContainer
                                    label='LYHYT ID'
                                    disabled={isEditingDisabled}
                                    value={node.shortId}
                                    onChange={this.onNodePropertiesChange('shortId')}
                                    validationResult={invalidPropertiesMap['length']}
                                />
                                <Dropdown
                                    label='TYYPPI'
                                    onChange={this.onNodePropertiesChange('type')}
                                    disabled={isEditingDisabled}
                                    selected={node.type}
                                    codeList={nodeTypeCodeList}
                                />
                            </div>
                        </div>
                        <div className={s.formSection}>
                            <NodeCoordinatesListView
                                node={this.props.nodeStore!.node}
                                onChangeCoordinates={this.onNodeGeometryChange}
                                isEditingDisabled={isEditingDisabled}
                            />
                        </div>
                        { node.type === NodeType.STOP &&
                            <StopForm
                                isEditingDisabled={isEditingDisabled}
                                stop={node.stop!}
                                onChange={this.onStopPropertiesChange}
                                invalidPropertiesMap={invalidPropertiesMap}
                            />
                        }
                    </div>
                </div>
                <Button
                    type={ButtonType.SAVE}
                    disabled={isSaveButtonDisabled}
                    onClick={this.save}
                >
                    Tallenna muutokset
                </Button>
            </div>
        );
    }
}

export default NodeView;
