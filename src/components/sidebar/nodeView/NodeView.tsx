import classnames from 'classnames';
import * as L from 'leaflet';
import _ from 'lodash';
import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { match } from 'react-router';
import { Button } from '~/components/controls';
import SavePrompt, { ISaveModel } from '~/components/overlays/SavePrompt';
import ViewFormBase from '~/components/shared/inheritedComponents/ViewFormBase';
import Loader from '~/components/shared/loader/Loader';
import ButtonType from '~/enums/buttonType';
import NodeMeasurementType from '~/enums/nodeMeasurementType';
import NodeType from '~/enums/nodeType';
import NodeFactory from '~/factories/nodeFactory';
import { ILink, INode } from '~/models';
import nodeValidationModel from '~/models/validationModels/nodeValidationModel';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import LinkService from '~/services/linkService';
import NodeService from '~/services/nodeService';
import { AlertStore } from '~/stores/alertStore';
import { CodeListStore } from '~/stores/codeListStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { MapStore } from '~/stores/mapStore';
import { INodeCacheObj, NodeStore } from '~/stores/nodeStore';
import NodeLocationType from '~/types/NodeLocationType';
import EventManager from '~/util/EventManager';
import SidebarHeader from '../SidebarHeader';
import NodeForm from './NodeForm';
import StopView from './StopView';
import * as s from './nodeView.scss';

interface INodeViewProps {
    isNewNode: boolean;
    match?: match<any>;
    alertStore?: AlertStore;
    nodeStore?: NodeStore;
    mapStore?: MapStore;
    errorStore?: ErrorStore;
    codeListStore?: CodeListStore;
    confirmStore?: ConfirmStore;
}

interface INodeViewState {
    isLoading: boolean;
    invalidPropertiesMap: object;
}

@inject('alertStore', 'nodeStore', 'mapStore', 'errorStore', 'codeListStore', 'confirmStore')
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

    async componentDidMount() {
        this.props.mapStore!.setIsMapCenteringPrevented(true);
        const params = this.props.match!.params.id;
        if (this.props.isNewNode) {
            await this.createNewNode(params);
        } else {
            await this.initExistingNode(params);
        }
        this.props.nodeStore!.setIsEditingDisabled(!this.props.isNewNode);
        this.isEditingDisabledListener = reaction(
            () => this.props.nodeStore!.isEditingDisabled,
            this.onChangeIsEditingDisabled
        );
        EventManager.on('geometryChange', () => this.props.nodeStore!.setIsEditingDisabled(false));
    }

    async componentDidUpdate(prevProps: INodeViewProps) {
        const params = this.props.match!.params.id;
        if (prevProps.match!.params.id !== params) {
            if (this.props.isNewNode) {
                await this.createNewNode(params);
            } else {
                await this.initExistingNode(params);
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
                const listener = this.nodePropertyListener(property);
                this.nodePropertyListeners.push(listener);
            }
        }
    };

    private nodePropertyListener = (property: string) => {
        return reaction(
            () => this.props.nodeStore!.node && this.props.nodeStore!.node![property],
            this.validateNodeProperty(property)
        );
    };

    private removeNodePropertyListeners = () => {
        this.nodePropertyListeners.forEach((listener: IReactionDisposer) => listener());
        this.nodePropertyListeners = [];
    };

    private createNewNode = async (params: any) => {
        const [lat, lng] = params.split(':');
        const coordinate = new L.LatLng(lat, lng);
        const node = NodeFactory.createNewNode(coordinate);
        this.centerMapToNode(node, []);
        this.props.nodeStore!.init({ node, links: [], isNewNode: true });
        this.validateNode();
        this.createNodePropertyListeners();
    };

    private initExistingNode = async (selectedNodeId: string) => {
        const nodeStore = this.props.nodeStore;
        this.setState({ isLoading: true });
        nodeStore!.clear();

        const _fetchNode = async () => {
            this.props.mapStore!.setSelectedNodeId(selectedNodeId);
            const node = await this.fetchNode(selectedNodeId);
            if (node) {
                const links = await this.fetchLinksForNode(node);
                if (links) {
                    this.initNode(node, links);
                }
            }
            this.setState({ isLoading: false });
        };

        const nodeCacheObj: INodeCacheObj | null = nodeStore!.getNodeCacheObjById(selectedNodeId);
        if (nodeCacheObj) {
            this.props.confirmStore!.openConfirm(
                <div>
                    Välimuistista löytyi tallentamaton solmu. Palautetaanko tallentamattoman solmun
                    tiedot ja jatketaan muokkausta?
                </div>,
                () => {
                    this.initNode(nodeCacheObj.node, nodeCacheObj.links);
                    nodeStore!.setIsEditingDisabled(false);
                    this.setState({ isLoading: false });
                },
                async () => {
                    await _fetchNode();
                }
            );
        } else {
            await _fetchNode();
        }
    };

    private initNode = (node: INode, links: ILink[]) => {
        this.props.mapStore!.setSelectedNodeId(node.id);
        this.centerMapToNode(node, links);
        this.props.nodeStore!.init({ node, links, isNewNode: false });
        this.validateNode();
        this.createNodePropertyListeners();
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

    private centerMapToNode = (node: INode, links: ILink[]) => {
        this.props.mapStore!.setIsMapCenteringPrevented(false);
        let latLngs: L.LatLng[] = [node.coordinates, node.coordinatesProjection];
        links.forEach((link: ILink) => {
            latLngs = latLngs.concat(link.geometry);
        });
        const bounds = L.latLngBounds(latLngs);
        this.props.mapStore!.setMapBounds(bounds);
    };

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

    private showSavePrompt = () => {
        const currentNode = _.cloneDeep(this.props.nodeStore!.node);
        const oldNode = _.cloneDeep(this.props.nodeStore!.oldNode);
        const currentStop = _.cloneDeep(currentNode.stop);
        const oldStop = _.cloneDeep(oldNode.stop);

        // Create node save model
        if (currentNode.stop) {
            delete currentNode['stop'];
            delete oldNode['stop'];
        }
        const saveModels: ISaveModel[] = [
            {
                newData: currentNode,
                oldData: oldNode,
                model: 'node'
            }
        ];

        // Create stop save model
        if (currentStop) {
            // Generate stopArea label values for savePrompt
            currentStop.areaId = `${currentStop.areaId} - ${currentStop.nameFi}`;
            if (oldStop && oldStop.areaId) {
                oldStop.areaId = `${oldStop.areaId} - ${oldStop.nameFi}`;
            }
            const stopSaveModel: ISaveModel = {
                newData: currentStop!,
                oldData: oldStop!,
                model: 'stop'
            };
            saveModels.push(stopSaveModel);
        }

        this.props.confirmStore!.openConfirm(<SavePrompt saveModels={saveModels} />, () => {
            this.save();
        });
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

    private validateNodeProperty = (property: string) => () => {
        const node = this.props.nodeStore!.node;
        if (!node) return;

        const value = node[property];
        this.validateProperty(nodeValidationModel[property], property, value);
    };

    private onNodeGeometryChange = (property: NodeLocationType, value: any) => {
        this.props.nodeStore!.updateNodeGeometry(property, value, NodeMeasurementType.Measured);
    };

    private onChangeNodeProperty = (property: keyof INode) => (value: any) => {
        this.props.nodeStore!.updateNode(property, value);
    };

    private latChange = (previousLatLng: L.LatLng, coordinateType: NodeLocationType) => (
        value: string
    ) => {
        const lat = Number(value);
        if (lat === previousLatLng.lat) return;
        this.onNodeGeometryChange(coordinateType, new L.LatLng(lat, previousLatLng.lng));
    };

    private lngChange = (previousLatLng: L.LatLng, coordinateType: NodeLocationType) => (
        value: string
    ) => {
        const lng = Number(value);
        if (lng === previousLatLng.lng) return;
        this.onNodeGeometryChange(coordinateType, new L.LatLng(previousLatLng.lat, lng));
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
                    <NodeForm
                        node={node}
                        isNewNode={this.props.isNewNode}
                        isEditingDisabled={isEditingDisabled}
                        invalidPropertiesMap={invalidPropertiesMap}
                        onChangeNodeProperty={this.onChangeNodeProperty}
                        lngChange={this.lngChange}
                        latChange={this.latChange}
                    />
                    {node.type === NodeType.STOP && node.stop && (
                        <StopView
                            isEditingDisabled={isEditingDisabled}
                            node={node}
                            onNodePropertyChange={this.onChangeNodeProperty}
                            isNewStop={this.props.isNewNode}
                            nodeInvalidPropertiesMap={invalidPropertiesMap}
                        />
                    )}
                </div>
                <Button
                    type={ButtonType.SAVE}
                    disabled={isSaveButtonDisabled}
                    onClick={() => (this.props.isNewNode ? this.save() : this.showSavePrompt())}
                >
                    {this.props.isNewNode ? 'Luo uusi solmu' : 'Tallenna muutokset'}
                </Button>
            </div>
        );
    }
}

export default NodeView;
