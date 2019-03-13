import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import { INode } from '~/models';
import { DialogStore } from '~/stores/dialogStore';
import { NodeStore } from '~/stores/nodeStore';
import { MapStore } from '~/stores/mapStore';
import LinkService from '~/services/linkService';
import { IValidationResult } from '~/validation/FormValidator';
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
import SidebarHeader from '../../SidebarHeader';
import StopForm from './StopForm';
import InputContainer from '../../InputContainer';
import * as s from './nodeView.scss';

interface INodeViewProps {
    match?: match<any>;
    dialogStore?: DialogStore;
    nodeStore?: NodeStore;
    mapStore?: MapStore;
    errorStore?: ErrorStore;
    isNewNode: boolean;
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

    async componentDidMount() {
        const selectedNodeId = this.props.match!.params.id;
        if (!selectedNodeId) return;

        this.setState({ isLoading: true });
        this.props.mapStore!.setSelectedNodeId(selectedNodeId);

        const node = await this.fetchNode(selectedNodeId);
        if (node) {
            const links = await this.fetchLinksForNode(node);
            if (links) {
                this.props.nodeStore!.init(node, links);
            }
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
        try {
            if (this.props.isNewNode) {
                await NodeService.createNode(this.props.nodeStore!.node);
            } else {
                await NodeService.updateNode(
                    this.props.nodeStore!.node,
                    this.props.nodeStore!.dirtyLinks,
                );
            }

            this.props.nodeStore!.setCurrentStateAsOld();
            this.props.dialogStore!.setFadeMessage('Tallennettu!');
        } catch (err) {
            const errMessage = err.message ? `, (${err.message})` : '';
            this.props.errorStore!.addError(`Tallennus epäonnistui${errMessage}`);
        }
        this.setState({ isLoading: false });
    }

    private onNodePropertiesChange = (
        property: string,
    ) => (
        value: any,
        validationResult?: IValidationResult,
    ) => {
        this.props.nodeStore!.updateNode(property, value);
        if (validationResult) {
            this.markInvalidProperties(property, validationResult!.isValid);
        }
    }

    private onNodeGeometryChange = (
        property: NodeLocationType,
    ) => (
        value: any, validationResult?: IValidationResult,
    ) => {
        this.props.nodeStore!.updateNodeGeometry(property, value);
        if (validationResult) {
            this.markInvalidProperties(property, validationResult!.isValid);
        }
    }

    private onStopChange =
        (property: string) => (value: any, validationResult?: IValidationResult) => {
            this.props.nodeStore!.updateStop(property, value);
            if (validationResult) {
                this.markInvalidProperties(property, validationResult!.isValid);
            }
        }

    private toggleIsEditingEnabled = () => {
        this.toggleIsEditingDisabled(
            this.props.nodeStore!.resetChanges,
        );
    }

    componentWillUnmount() {
        this.props.nodeStore!.clear();
        this.props.mapStore!.setSelectedNodeId(null);
    }

    render() {
        const node = this.props.nodeStore!.node;
        const isEditingDisabled = this.state.isEditingDisabled;

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
                                onChange={this.onStopChange}
                                stop={node.stop!}
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
