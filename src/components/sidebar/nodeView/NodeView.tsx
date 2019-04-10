import * as React from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { match } from 'react-router';
import { LatLng } from 'leaflet';
import NodeFactory from '~/factories/nodeFactory';
import { INode } from '~/models';
import { DialogStore } from '~/stores/dialogStore';
import { NodeStore } from '~/stores/nodeStore';
import { MapStore } from '~/stores/mapStore';
import LinkService from '~/services/linkService';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import { Button, Dropdown } from '~/components/controls';
import NodeLocationType from '~/types/NodeLocationType';
import nodeValidationModel from '~/models/validationModels/nodeValidationModel';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import NodeType from '~/enums/nodeType';
import { ErrorStore } from '~/stores/errorStore';
import { CodeListStore } from '~/stores/codeListStore';
import NodeService from '~/services/nodeService';
import routeBuilder from '~/routing/routeBuilder';
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
    codeListStore?: CodeListStore;
}

interface INodeViewState {
    isLoading: boolean;
    isEditingDisabled: boolean;
    invalidPropertiesMap: object;
}

@inject('dialogStore', 'nodeStore', 'mapStore', 'errorStore', 'codeListStore')
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
        super.componentDidMount();
        const params = this.props.match!.params.id;
        if (this.props.isNewNode) {
            this.initNewNode(params);
        } else {
            this.initExistingNode(params);
        }
    }

    componentDidUpdate(prevProps: INodeViewProps) {
        const params = this.props.match!.params.id;

        if (prevProps.match!.params.id !== params) {
            if (this.props.isNewNode) {
                this.initNewNode(params);
            } else {
                this.initExistingNode(params);
            }
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.props.nodeStore!.clear();
        this.props.mapStore!.setSelectedNodeId(null);
    }

    private initNewNode = async (params: any) => {
        const [lat, lng] = params.split(':');
        const coordinate = new LatLng(lat, lng);
        const newNode = NodeFactory.createNewNode(coordinate);
        this.props.nodeStore!.init(newNode, []);
        this.validateNode();
    }

    private initExistingNode = async (selectedNodeId: string) => {
        this.setState({ isLoading: true });
        this.props.nodeStore!.clear();

        this.props.mapStore!.setSelectedNodeId(selectedNodeId);
        const node = await this.fetchNode(selectedNodeId);
        if (node) {
            const links = await this.fetchLinksForNode(node);
            if (links) {
                this.props.nodeStore!.init(node, links);
            }
            this.validateNode();
        }
        this.setState({ isLoading: false });
    }

    private async fetchNode(nodeId: string) {
        try {
            return await NodeService.fetchNode(nodeId);
        } catch (e) {
            this.props.errorStore!.addError('Solmun haku ei onnistunut', e);
            return null;
        }
    }

    private async fetchLinksForNode(node: INode) {
        try {
            return await LinkService.fetchLinksWithStartNodeOrEndNode(node.id);
        } catch (e) {
            this.props.errorStore!.addError(
                // tslint:disable-next-line:max-line-length
                `Haku löytää linkkejä, joilla lnkalkusolmu tai lnkloppusolmu on ${node.id} (soltunnus), ei onnistunut.`,
                e,
            );
            return null;
        }
    }

    private save = async () => {
        this.setState({ isLoading: true });
        let preventSetState = false;
        try {
            if (this.props.isNewNode) {
                const nodeId = await NodeService.createNode(this.props.nodeStore!.node);
                preventSetState = true;

                const url = routeBuilder
                    .to(SubSites.node)
                    .toTarget(nodeId)
                    .toLink();
                navigator.goTo(url);
            } else {
                await NodeService.updateNode(
                    this.props.nodeStore!.node,
                    this.props.nodeStore!.getDirtyLinks(),
                );
            }

            this.props.nodeStore!.setCurrentStateAsOld();
            this.props.dialogStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }

        if (preventSetState) return;
        this.setState({ isLoading: false });
    }

    private toggleIsEditingEnabled = () => {
        this.toggleIsEditingDisabled(
            this.props.nodeStore!.resetChanges,
        );
    }

    private validateNode = () => {
        const node = this.props.nodeStore!.node;
        this.validateAllProperties(nodeValidationModel, node);
    }

    private onNodeGeometryChange = (property: NodeLocationType) => (value: any) => {
        this.props.nodeStore!.updateNodeGeometry(property, value);
        this.validateProperty(nodeValidationModel[property], property, value);
    }

    private onNodePropertyChange = (property: string) => (value: any) => {
        this.props.nodeStore!.updateNode(property, value);
        this.validateProperty(nodeValidationModel[property], property, value);
        if (property === 'type') {
            this.validateNode();
        }
    }

    render() {
        const node = this.props.nodeStore!.node;
        if (this.state.isLoading) {
            return(
                <div className={classnames(s.nodeView, s.loaderContainer)}>
                    <Loader/>
                </div>
            );
        }
        // TODO: show some indicator to user of an empty page
        if (!node) return null;

        const isEditingDisabled = this.state.isEditingDisabled;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        const isNodeFormInvalid = !this.isFormValid();
        const isStopFormInvalid = node.type === NodeType.STOP
            && !this.props.nodeStore!.isStopFormValid;
        const isSaveButtonDisabled = this.state.isEditingDisabled
            || !this.props.nodeStore!.isDirty
            || isNodeFormInvalid
            || isStopFormInvalid;
        const nodeTypeCodeListWithoutDisabled =
            this.props.codeListStore!
                .getCodeList('Solmutyyppi (P/E)')
                .filter(item => item.value !== 'E');
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
                                <Dropdown
                                    label='LYHYTTUNNUS (2 kirj.'
                                    onChange={this.onNodePropertyChange('shortIdLetter')}
                                    disabled={isEditingDisabled}
                                    selected={node.shortIdLetter}
                                    isValueIncludedInLabel={true}
                                    items={
                                        this.props.codeListStore!.getCodeList(
                                            'Lyhyttunnus')}
                                />
                                <InputContainer
                                    label='+ 4 num.)'
                                    disabled={isEditingDisabled}
                                    value={node.shortIdString}
                                    onChange={this.onNodePropertyChange('shortIdString')}
                                    validationResult={invalidPropertiesMap['shortIdString']}
                                />
                                <Dropdown
                                    label='TYYPPI'
                                    onChange={this.onNodePropertyChange('type')}
                                    disabled={isEditingDisabled}
                                    selected={node.type}
                                    items={nodeTypeCodeListWithoutDisabled}
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
                        { node.type === NodeType.STOP && node.stop &&
                            <StopForm
                                isEditingDisabled={isEditingDisabled}
                                stop={node.stop!}
                                invalidPropertiesMap={invalidPropertiesMap}
                                getDropDownItems={this.props.codeListStore!.getCodeList}
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
