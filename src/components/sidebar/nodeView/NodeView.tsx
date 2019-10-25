import classnames from 'classnames';
import { LatLng } from 'leaflet';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { match } from 'react-router';
import { Button, Dropdown } from '~/components/controls';
import TextContainer from '~/components/controls/TextContainer';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import Loader from '~/components/shared/loader/Loader';
import ButtonType from '~/enums/buttonType';
import NodeMeasurementType from '~/enums/nodeMeasurementType';
import NodeType from '~/enums/nodeType';
import StartNodeType from '~/enums/startNodeType';
import NodeFactory from '~/factories/nodeFactory';
import { INode } from '~/models';
import nodeValidationModel from '~/models/validationModels/nodeValidationModel';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import LinkService from '~/services/linkService';
import NodeService from '~/services/nodeService';
import { AlertStore } from '~/stores/alertStore';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import { MapStore } from '~/stores/mapStore';
import { NodeStore } from '~/stores/nodeStore';
import NodeLocationType from '~/types/NodeLocationType';
import EventManager from '~/util/EventManager';
import NodeHelper from '~/util/nodeHelper';
import InputContainer from '../../controls/InputContainer';
import SidebarHeader from '../SidebarHeader';
import StopForm from './StopForm';
import * as s from './nodeView.scss';

interface INodeViewProps {
    isNewNode: boolean;
    match?: match<any>;
    alertStore?: AlertStore;
    nodeStore?: NodeStore;
    mapStore?: MapStore;
    errorStore?: ErrorStore;
    codeListStore?: CodeListStore;
}

interface INodeViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
}

@inject('alertStore', 'nodeStore', 'mapStore', 'errorStore', 'codeListStore')
@observer
class NodeView extends ViewFormBase<INodeViewProps, INodeViewState> {
    private isEditingDisabledListener: IReactionDisposer;
    private nodePropertyListeners: IReactionDisposer[];
    constructor(props: INodeViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            invalidPropertiesMap: {}
        };
        this.nodePropertyListeners = [];
    }

    componentDidMount() {
        const params = this.props.match!.params.id;
        if (this.props.isNewNode) {
            this.initNewNode(params);
        } else {
            this.initExistingNode(params);
        }
        this.props.nodeStore!.setIsEditingDisabled(!this.props.isNewNode);
        this.isEditingDisabledListener = reaction(
            () => this.props.nodeStore!.isEditingDisabled,
            this.onChangeIsEditingDisabled
        );
        EventManager.on('geometryChange', () => this.props.nodeStore!.setIsEditingDisabled(false));
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
        this.props.nodeStore!.clear();
        this.props.mapStore!.setSelectedNodeId(null);
        this.isEditingDisabledListener();
        this.removeNodePropertyListeners();
        EventManager.off('geometryChange', () => this.props.nodeStore!.setIsEditingDisabled(false));
    }

    private createNodePropertyListeners = () => {
        const nodeStore = this.props.nodeStore!;
        if (!nodeStore!.node) return;

        const node = nodeStore!.node;
        for (const property in node!) {
            if (Object.prototype.hasOwnProperty.call(node, property)) {
                const listener = this.createListener(property);
                this.nodePropertyListeners.push(listener);
            }
        }
    };

    private createListener = (property: string) => {
        return reaction(
            () => this.props.nodeStore!.node && this.props.nodeStore!.node![property],
            this.validateNode
        );
    };

    private removeNodePropertyListeners = () => {
        this.nodePropertyListeners.forEach((listener: IReactionDisposer) => listener());
        this.nodePropertyListeners = [];
    };

    private initNewNode = async (params: any) => {
        const [lat, lng] = params.split(':');
        const coordinate = new LatLng(lat, lng);
        const newNode = NodeFactory.createNewNode(coordinate);
        this.props.nodeStore!.init({ node: newNode, links: [], isNewNode: true });
        this.validateNode();
        this.createNodePropertyListeners();
    };

    private initExistingNode = async (selectedNodeId: string) => {
        this.setState({ isLoading: true });
        this.props.nodeStore!.clear();

        this.props.mapStore!.setSelectedNodeId(selectedNodeId);
        const node = await this.fetchNode(selectedNodeId);
        if (node) {
            const links = await this.fetchLinksForNode(node);
            if (links) {
                this.props.nodeStore!.init({ node, links, isNewNode: false });
            }
            this.validateNode();
            this.createNodePropertyListeners();
        }
        this.setState({ isLoading: false });
    };

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
                `Haku löytää linkkejä, joilla lnkalkusolmu tai lnkloppusolmu on ${
                    node.id
                } (soltunnus), ei onnistunut.`,
                e
            );
            return null;
        }
    }

    private save = async () => {
        this.setState({ isLoading: true });
        try {
            if (this.props.isNewNode) {
                const nodeId = await NodeService.createNode(this.props.nodeStore!.node);
                const url = routeBuilder
                    .to(SubSites.node)
                    .toTarget(':id', nodeId)
                    .toLink();
                navigator.goTo(url);
            } else {
                await NodeService.updateNode(
                    this.props.nodeStore!.node,
                    this.props.nodeStore!.getDirtyLinks()
                );
            }
            this.props.nodeStore!.setCurrentStateAsOld();
            this.props.alertStore!.setFadeMessage('Tallennettu!');
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }

        if (this.props.isNewNode) return;
        this.setState({ isLoading: false });
        this.props.nodeStore!.setIsEditingDisabled(true);
    };

    private onChangeIsEditingDisabled = () => {
        this.clearInvalidPropertiesMap();
        if (this.props.nodeStore!.isEditingDisabled) {
            this.props.nodeStore!.resetChanges();
        } else {
            this.validateNode();
        }
    };

    private validateNode = () => {
        this.validateAllProperties(nodeValidationModel, this.props.nodeStore!.node);
    };

    private onNodeGeometryChange = (property: NodeLocationType, value: any) => {
        this.props.nodeStore!.updateNodeGeometry(property, value, NodeMeasurementType.Measured);
    };

    private onChangeNodeProperty = (property: keyof INode) => (value: any) => {
        this.props.nodeStore!.updateNode(property, value);
    };

    private latChange = (previousLatLng: LatLng, coordinateType: NodeLocationType) => (
        value: string
    ) => {
        const lat = Number(value);
        if (lat === previousLatLng.lat) return;
        this.onNodeGeometryChange(coordinateType, new LatLng(lat, previousLatLng.lng));
    };

    private lngChange = (previousLatLng: LatLng, coordinateType: NodeLocationType) => (
        value: string
    ) => {
        const lng = Number(value);
        if (lng === previousLatLng.lng) return;
        this.onNodeGeometryChange(coordinateType, new LatLng(previousLatLng.lat, lng));
    };

    render() {
        const node = this.props.nodeStore!.node;
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.nodeView, s.loaderContainer)}>
                    <Loader />
                </div>
            );
        }
        // TODO: show some indicator to user of an empty page
        if (!node) return null;

        const isEditingDisabled = this.props.nodeStore!.isEditingDisabled;
        const invalidPropertiesMap = this.state.invalidPropertiesMap;
        const isNodeFormInvalid = !this.isFormValid();
        const isStopFormInvalid =
            node.type === NodeType.STOP && !this.props.nodeStore!.isStopFormValid;
        const isSaveButtonDisabled =
            isEditingDisabled ||
            !this.props.nodeStore!.isDirty ||
            isNodeFormInvalid ||
            isStopFormInvalid;
        const nodeTypeCodeList = this.props
            .codeListStore!.getDropdownItemList('Solmutyyppi (P/E)')
            .filter(item => item.value !== StartNodeType.DISABLED);
        return (
            <div className={s.nodeView}>
                <div className={s.content}>
                    <SidebarHeader
                        isEditButtonVisible={!this.props.isNewNode}
                        shouldShowClosePromptMessage={this.props.nodeStore!.isDirty}
                        isEditing={!isEditingDisabled}
                        onEditButtonClick={this.props.nodeStore!.toggleIsEditingDisabled}
                    >
                        Solmu {node.id}
                    </SidebarHeader>
                    <div className={s.form}>
                        <div className={s.formSection}>
                            <div className={s.flexRow}>
                                <Dropdown
                                    label='TYYPPI'
                                    onChange={this.onChangeNodeProperty('type')}
                                    disabled={isEditingDisabled}
                                    selected={node.type}
                                    items={nodeTypeCodeList}
                                />
                                <Dropdown
                                    label='MATKA-AIKAPISTE'
                                    disabled={isEditingDisabled}
                                    items={this.props.codeListStore!.getDropdownItemList(
                                        'Kyllä/Ei'
                                    )}
                                    selected={node.tripTimePoint}
                                    onChange={this.onChangeNodeProperty('tripTimePoint')}
                                />
                            </div>
                            {!this.props.isNewNode && (
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
                                    onChange={this.latChange(node.coordinates, 'coordinates')}
                                    label='LATITUDE'
                                    type='number'
                                    disabled={isEditingDisabled}
                                    validationResult={invalidPropertiesMap['coordinates']}
                                />
                                <InputContainer
                                    value={node.coordinates.lng}
                                    onChange={this.lngChange(node.coordinates, 'coordinates')}
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
                                    onChange={this.onChangeNodeProperty('measurementDate')}
                                    isClearButtonVisibleOnDates={true}
                                    validationResult={invalidPropertiesMap['measurementDate']}
                                />
                                {node.type === NodeType.STOP && (
                                    <TextContainer
                                        label='MITTAUSTAPA'
                                        value={NodeHelper.getMeasurementTypeLabel(
                                            node.measurementType
                                        )}
                                    />
                                )}
                            </div>
                            {node.type === NodeType.STOP && (
                                <>
                                    <div className={s.sectionHeader}>
                                        Sovitettu piste
                                        <div className={classnames(s.labelIcon, s.manual)} />
                                    </div>
                                    <div className={s.flexRow}>
                                        <InputContainer
                                            value={node.coordinatesManual.lat}
                                            onChange={this.latChange(
                                                node.coordinatesManual,
                                                'coordinatesManual'
                                            )}
                                            label='LATITUDE'
                                            type='number'
                                            disabled={isEditingDisabled}
                                            validationResult={
                                                invalidPropertiesMap['coordinatesManual']
                                            }
                                        />
                                        <InputContainer
                                            value={node.coordinatesManual.lng}
                                            onChange={this.lngChange(
                                                node.coordinatesManual,
                                                'coordinatesManual'
                                            )}
                                            label='LONGITUDE'
                                            type='number'
                                            disabled={isEditingDisabled}
                                            validationResult={
                                                invalidPropertiesMap['coordinatesManual']
                                            }
                                        />
                                    </div>
                                    <div className={s.sectionHeader}>
                                        Projisoitu piste
                                        <div className={classnames(s.labelIcon, s.projected)} />
                                    </div>
                                    <div className={s.flexRow}>
                                        <InputContainer
                                            value={node.coordinatesProjection.lat}
                                            onChange={this.latChange(
                                                node.coordinatesProjection,
                                                'coordinatesProjection'
                                            )}
                                            label='LATITUDE'
                                            type='number'
                                            disabled={isEditingDisabled}
                                            validationResult={
                                                invalidPropertiesMap['coordinatesProjection']
                                            }
                                        />
                                        <InputContainer
                                            value={node.coordinatesProjection.lng}
                                            onChange={this.lngChange(
                                                node.coordinatesProjection,
                                                'coordinatesProjection'
                                            )}
                                            label='LONGITUDE'
                                            type='number'
                                            disabled={isEditingDisabled}
                                            validationResult={
                                                invalidPropertiesMap['coordinatesProjection']
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        {node.type === NodeType.STOP && node.stop && (
                            <StopForm
                                isEditingDisabled={isEditingDisabled}
                                node={node}
                                onNodePropertyChange={this.onChangeNodeProperty}
                                isNewStop={this.props.isNewNode}
                                nodeInvalidPropertiesMap={invalidPropertiesMap}
                            />
                        )}
                    </div>
                </div>
                <Button type={ButtonType.SAVE} disabled={isSaveButtonDisabled} onClick={this.save}>
                    Tallenna muutokset
                </Button>
            </div>
        );
    }
}

export default NodeView;
