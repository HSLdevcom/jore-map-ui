import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { IReactionDisposer, reaction } from 'mobx';
import classnames from 'classnames';
import { match } from 'react-router';
import { LatLng } from 'leaflet';
import NodeFactory from '~/factories/nodeFactory';
import { INode } from '~/models';
import { AlertStore } from '~/stores/alertStore';
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
import NodeMeasurementType from '~/enums/nodeMeasurementType';
import TextContainer from '~/components/controls/TextContainer';
import EventManager from '~/util/EventManager';
import NodeHelper from '~/util/nodeHelper';
import StartNodeType from '~/enums/startNodeType';
import { ErrorStore } from '~/stores/errorStore';
import { CodeListStore } from '~/stores/codeListStore';
import NodeService from '~/services/nodeService';
import routeBuilder from '~/routing/routeBuilder';
import ButtonType from '~/enums/buttonType';
import Loader from '~/components/shared/loader/Loader';
import SidebarHeader from '../SidebarHeader';
import StopForm from './StopForm';
import InputContainer from '../../controls/InputContainer';
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
    isEditingDisabled: boolean; // TODO: remove
    invalidPropertiesMap: object;
}

@inject('alertStore', 'nodeStore', 'mapStore', 'errorStore', 'codeListStore')
@observer
class NodeView extends ViewFormBase<INodeViewProps, INodeViewState> {
    private isEditingDisabledListener: IReactionDisposer;
    constructor(props: INodeViewProps) {
        super(props);
        this.state = {
            isLoading: false,
            isEditingDisabled: !props.isNewNode, // TODO: remove
            invalidPropertiesMap: {}
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
        this.setIsEditingDisabled(!this.props.isNewNode);
        this.isEditingDisabledListener = reaction(
            () => this.props.nodeStore!.isEditingDisabled,
            this.onChangeIsEditingDisabled
        );
        EventManager.on('geometryChange', () => this.setIsEditingDisabled(false));
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
        this.isEditingDisabledListener();
        EventManager.off('geometryChange', () => this.setIsEditingDisabled(false));
    }

    private initNewNode = async (params: any) => {
        const [lat, lng] = params.split(':');
        const coordinate = new LatLng(lat, lng);
        const newNode = NodeFactory.createNewNode(coordinate);
        this.props.nodeStore!.init(newNode, []);
        this.validateNode();
    };

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
                `Haku löytää linkkejä, joilla lnkalkusolmu tai lnkloppusolmu on ${node.id} (soltunnus), ei onnistunut.`,
                e
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

        if (preventSetState) return;
        this.setState({ isLoading: false });
    };

    private setIsEditingDisabled = (isEditingDisabled: boolean) => {
        this.props.nodeStore!.setIsEditingDisabled(isEditingDisabled);
    };

    private toggleIsEditingEnabled = () => {
        this.props.nodeStore!.toggleIsEditingDisabled();
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
        const node = this.props.nodeStore!.node;
        this.validateAllProperties(nodeValidationModel, node);
    };

    private onNodeGeometryChange = (property: NodeLocationType, value: any) => {
        this.props.nodeStore!.updateNodeGeometry(property, value, NodeMeasurementType.Measured);
        this.validateProperty(nodeValidationModel[property], property, value);
    };

    private onChangeNodeProperty = (property: keyof INode) => (value: any) => {
        this.props.nodeStore!.updateNode(property, value);
        this.validateProperty(nodeValidationModel[property], property, value);
        if (property === 'type') {
            this.validateNode();
        }
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
                        onEditButtonClick={this.toggleIsEditingEnabled}
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
                                />
                                <InputContainer
                                    value={node.coordinates.lng}
                                    onChange={this.lngChange(node.coordinates, 'coordinates')}
                                    label='LONGITUDE'
                                    type='number'
                                    disabled={isEditingDisabled}
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
                                        />
                                    </div>
                                    <div className={s.sectionHeader}>
                                        Projektoitu piste
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
