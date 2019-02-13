import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import { INode } from '~/models';
import { NodeStore } from '~/stores/nodeStore';
import { MapStore } from '~/stores/mapStore';
import LinkService from '~/services/linkService';
import { IValidationResult } from '~/validation/FormValidator';
import { Button, Dropdown } from '~/components/controls';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import NodeType from '~/enums/nodeType';
import NodeService from '~/services/nodeService';
import { DialogStore } from '~/stores/dialogStore';
import nodeTypeCodeList from '~/codeLists/nodeTypeCodeList';
import { ErrorStore } from '~/stores/errorStore';
import ButtonType from '~/enums/buttonType';
import Loader from '~/components/shared/loader/Loader';
import NodeCoordinatesListView from './NodeCoordinatesListView';
import ViewHeader from '../../ViewHeader';
import StopForm from './StopForm';
import InputContainer from '../../InputContainer';
import * as s from './nodeView.scss';

interface INodeViewProps {
    match?: match<any>;
    nodeStore?: NodeStore;
    mapStore?: MapStore;
    errorStore?: ErrorStore;
    dialogStore?: DialogStore;
}

interface INodeViewState {
    isLoading: boolean;
    isEditingDisabled: boolean;
    invalidFieldsMap: object;
}

@inject('nodeStore', 'mapStore', 'errorStore', 'dialogStore')
@observer
class NodeView extends ViewFormBase<INodeViewProps, INodeViewState> {
    constructor(props: INodeViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            isEditingDisabled: true,
            invalidFieldsMap: {},
        };
    }

    async componentDidMount() {
        const selectedNodeId = this.props.match!.params.id;

        this.setState({ isLoading: true });
        if (selectedNodeId) {
            this.props.mapStore!.setSelectedNodeId(selectedNodeId);
            await this.fetchNode(selectedNodeId);
        }
        const node = this.props.nodeStore!.node;
        if (node) {
            await this.fetchLinksForNode(node);
            this.props.mapStore!.setCoordinates(node.coordinates);
        }
        this.setState({ isLoading: false });
    }

    private async fetchNode(nodeId: string) {
        const node = await NodeService.fetchNode(nodeId);
        if (node) {
            this.props.nodeStore!.setNode(node);
        }
    }

    private async fetchLinksForNode(node: INode) {
        const links = await LinkService.fetchLinksWithStartNodeOrEndNode(node.id);
        if (links) {
            this.props.nodeStore!.setLinks(links);
        }
    }

    private save = async () => {
        this.setState({ isLoading: true });
        try {
            await NodeService.updateNode(this.props.nodeStore!.node);

            this.props.nodeStore!.setOldNode(this.props.nodeStore!.node);
            this.props.dialogStore!.setFadeMessage('Tallennus onnistui');
        } catch (err) {
            const errMessage = err.message ? `, (${err.message})` : '';
            this.props.errorStore!.addError(`Tallennus epäonnistui${errMessage}`);
        }
        this.setState({ isLoading: false });
    }

    private onNodeChange =
        (property: string) => (value: any, validationResult?: IValidationResult) => {
            this.props.nodeStore!.updateNode(property, value);
            if (validationResult) {
                this.markInvalidFields(property, validationResult!.isValid);
            }
        }

    private onStopChange =
        (property: string) => (value: any, validationResult?: IValidationResult) => {
            this.props.nodeStore!.updateStop(property, value);
            if (validationResult) {
                this.markInvalidFields(property, validationResult!.isValid);
            }
        }

    private toggleIsEditingEnabled = () => {
        this.toggleIsEditingDisabled(
            this.props.nodeStore!.undoChanges,
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

        // tslint:disable-next-line:max-line-length
        const closePromptMessage = 'Solmulla on tallentamattomia muutoksia. Oletko varma, että haluat poistua näkymästä? Tallentamattomat muutokset kumotaan.';

        if (this.state.isLoading || !node || !node.id) {
            return(
                <div className={classnames(s.nodeView, s.loaderContainer)}>
                    <Loader/>
                </div>
            );
        }
        return (
            <div className={s.nodeView}>
                <div className={s.content}>
                    <ViewHeader
                        closePromptMessage={
                            this.props.nodeStore!.isDirty ? closePromptMessage : undefined
                        }
                        isEditButtonVisible={true}
                        isEditing={!isEditingDisabled}
                        onEditButtonClick={this.toggleIsEditingEnabled}
                    >
                        Solmu {node.id}
                    </ViewHeader>
                    <div className={s.form}>
                        <div className={s.formSection}>
                            <div className={s.flexRow}>
                                <InputContainer
                                    label='LYHYT ID'
                                    disabled={isEditingDisabled}
                                    value={node.shortId}
                                    onChange={this.onNodeChange('shortId')}
                                />
                                <Dropdown
                                    label='TYYPPI'
                                    onChange={this.onNodeChange('type')}
                                    disabled={isEditingDisabled}
                                    selected={node.type}
                                    codeList={nodeTypeCodeList}
                                />
                            </div>
                        </div>
                        <div className={s.formSection}>
                            <NodeCoordinatesListView
                                node={this.props.nodeStore!.node}
                                onChangeCoordinates={this.onNodeChange}
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
