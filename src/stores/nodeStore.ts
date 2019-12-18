import { LatLng } from 'leaflet';
import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import NodeMeasurementType from '~/enums/nodeMeasurementType';
import NodeType from '~/enums/nodeType';
import NodeStopFactory from '~/factories/nodeStopFactory';
import { ILink, INode, IStop } from '~/models';
import nodeValidationModel, {
    editableNodeIdValidationModel,
    INodeValidationModel
} from '~/models/validationModels/nodeValidationModel';
import stopValidationModel, {
    IStopValidationModel
} from '~/models/validationModels/stopValidationModel';
import GeocodingService from '~/services/geocodingService';
import { IStopAreaItem } from '~/services/stopAreaService';
import GeometryUndoStore from '~/stores/geometryUndoStore';
import NodeLocationType from '~/types/NodeLocationType';
import { roundLatLng, roundLatLngs } from '~/util/geomHelpers';
import FormValidator from '~/validation/FormValidator';
import NetworkStore from './networkStore';
import ValidationStore, { ICustomValidatorMap } from './validationStore';

interface UndoState {
    node: INode;
    links: ILink[];
}

interface INodeCacheObj {
    node: INode;
    oldNode: INode;
    links: ILink[];
    oldLinks: ILink[];
    isNodeIdEditable: boolean;
}

interface INodeCache {
    newNodeCache: INodeCacheObj | null; // Have slot for new node in its own property because new node's dont have id
    [nodeId: string]: INodeCacheObj | null;
}

class NodeStore {
    @observable private _links: ILink[];
    @observable private _node: INode | null;
    @observable private _oldNode: INode | null;
    @observable private _oldLinks: ILink[];
    @observable private _isEditingDisabled: boolean;
    @observable private _nodeCache: INodeCache;
    @observable private _stopAreaItems: IStopAreaItem[];
    @observable private _isNodeIdEditable: boolean;
    private _geometryUndoStore: GeometryUndoStore<UndoState>;
    private _nodeValidationStore: ValidationStore<INode, INodeValidationModel>;
    private _stopValidationStore: ValidationStore<IStop, IStopValidationModel>;

    constructor() {
        this._links = [];
        this._node = null;
        this._oldNode = null;
        this._oldLinks = [];
        this._geometryUndoStore = new GeometryUndoStore();
        this._nodeValidationStore = new ValidationStore();
        this._stopValidationStore = new ValidationStore();
        this._isEditingDisabled = true;
        this._nodeCache = {
            newNodeCache: null
        };

        reaction(
            () => this.isDirty,
            (value: boolean) => NetworkStore.setShouldShowNodeOpenConfirm(value)
        );
        reaction(
            () => this._node && this._node.stop && this._node.stop.stopAreaId,
            (value: string) => this.onStopAreaChange(value)
        );
        reaction(() => this._stopAreaItems, () => this.onStopAreaItemsChange());
        reaction(() => this._isEditingDisabled, this.onChangeIsEditingDisabled);
    }

    @computed
    get links() {
        return this._links;
    }

    @computed
    get node() {
        return this._node!;
    }

    @computed
    get oldNode() {
        return this._oldNode!;
    }

    @computed
    get isDirty() {
        return !_.isEqual(this._node, this._oldNode) || !_.isEqual(this._links, this._oldLinks);
    }

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    @computed
    get nodeCache() {
        return this._nodeCache;
    }

    @computed
    get stopAreaItems() {
        return this._stopAreaItems;
    }

    @computed
    get isNodeIdEditable() {
        return this._isNodeIdEditable;
    }

    @computed
    get isNodeFormValid() {
        return this._nodeValidationStore.isValid();
    }

    @computed
    get nodeInvalidPropertiesMap() {
        return this._nodeValidationStore.getInvalidPropertiesMap();
    }

    @computed
    get isStopFormValid() {
        return this._stopValidationStore.isValid();
    }

    @computed
    get stopInvalidPropertiesMap() {
        return this._stopValidationStore.getInvalidPropertiesMap();
    }

    @action
    public init = ({
        node,
        links,
        isNewNode,
        oldNode,
        oldLinks
    }: {
        node: INode;
        links: ILink[];
        isNewNode: boolean;
        oldNode?: INode;
        oldLinks?: ILink[];
    }) => {
        this.clear();

        const newNode = _.cloneDeep(node);
        const newLinks = _.cloneDeep(links);

        const currentUndoState: UndoState = {
            links: newLinks,
            node: newNode
        };
        this._geometryUndoStore.addItem(currentUndoState);

        this._node = newNode;
        this._oldNode = oldNode ? oldNode : newNode;
        this._links = newLinks;
        this._oldLinks = oldLinks ? oldLinks : newLinks;
        this._isEditingDisabled = !isNewNode;

        const customValidatorMap: ICustomValidatorMap = {
            id: {
                validator: (node: INode, property: string, nodeId: string) => {
                    if (this.isNodeIdEditable) {
                        const validationResult = FormValidator.validateProperty(
                            editableNodeIdValidationModel.id,
                            nodeId
                        );
                        return validationResult;
                    }
                    return;
                }
            },
            idSuffix: {
                validator: (node: INode, property: string, idSuffix: string) => {
                    if (this.isNodeIdEditable) {
                        const validationResult = FormValidator.validateProperty(
                            editableNodeIdValidationModel.idSuffix,
                            idSuffix
                        );
                        return validationResult;
                    }
                    return;
                }
            }
        };

        this._nodeValidationStore.init(node, nodeValidationModel, customValidatorMap);
        if (node.stop) {
            this._stopValidationStore.init(node.stop, stopValidationModel);
        }
    };

    @action
    public setCurrentStateAsOld = () => {
        this._oldLinks = _.cloneDeep(this._links);
        this._oldNode = _.cloneDeep(this._node);
    };

    @action
    public updateLinkGeometry = (latLngs: L.LatLng[], index: number) => {
        if (!this._node) throw new Error('Node was null.'); // Should not occur

        const newLinks = _.cloneDeep(this._links);
        newLinks[index].geometry = roundLatLngs(latLngs);
        const currentUndoState: UndoState = {
            links: newLinks,
            node: this._node
        };
        this._geometryUndoStore.addItem(currentUndoState);

        this._links = newLinks;
    };

    @action
    public updateNodeGeometry = (
        nodeLocationType: NodeLocationType,
        newCoordinates: LatLng,
        measurementType: NodeMeasurementType
    ) => {
        if (!this._node) throw new Error('Node was null.'); // Should not occur

        const newNode = _.cloneDeep(this._node);
        const newLinks = _.cloneDeep(this._links);

        newNode[nodeLocationType] = roundLatLng(newCoordinates);

        if (nodeLocationType === 'coordinates') this.mirrorCoordinates(newNode);

        const coordinatesProjection = newNode.coordinatesProjection;
        // Update the first link geometry of startNodes to coordinatesProjection
        newLinks
            .filter(link => link.startNode.id === newNode!.id)
            .map(link => (link.geometry[0] = coordinatesProjection));
        // Update the last link geometry of endNodes to coordinatesProjection
        newLinks
            .filter(link => link.endNode.id === newNode!.id)
            .map(link => (link.geometry[link.geometry.length - 1] = coordinatesProjection));

        const currentUndoState: UndoState = {
            links: newLinks,
            node: newNode
        };
        this._geometryUndoStore.addItem(currentUndoState);

        this._links = newLinks;
        const geometryVariables: NodeLocationType[] = ['coordinates', 'coordinatesProjection'];
        geometryVariables.forEach(coordinateName =>
            this.updateNodeProperty(coordinateName, newNode[coordinateName])
        );

        if (nodeLocationType === 'coordinates') {
            this.updateNodeProperty('measurementType', measurementType.toString());
        }

        if (nodeLocationType === 'coordinatesProjection') {
            this.fetchAddressData();
        }
    };

    @action
    public mirrorCoordinates = (node: INode) => {
        if (node.type !== NodeType.STOP) {
            node.coordinatesProjection = node.coordinates;
        }
    };

    @action
    public fetchAddressData = async () => {
        if (!this.node || !this.node.stop) return;

        const coordinates = this.node.coordinatesProjection;
        const addressFi: string = await GeocodingService.fetchStreetNameFromCoordinates(
            coordinates,
            'fi'
        );
        const addressSw: string = await GeocodingService.fetchStreetNameFromCoordinates(
            coordinates,
            'sv'
        );
        const postalNumber: string = await GeocodingService.fetchPostalNumberFromCoordinates(
            coordinates
        );
        this.updateStopProperty('addressFi', addressFi);
        this.updateStopProperty('addressSw', addressSw);
        this.updateStopProperty('postalNumber', postalNumber);
    };

    @action
    public updateNodeProperty = (property: keyof INode, value: string | Date | LatLng) => {
        if (!this._node) return;

        (this._node as any)[property] = value;
        this._nodeValidationStore.updateProperty(property, value);

        if (property === 'type') this.mirrorCoordinates(this._node);

        if (this._node.type === NodeType.STOP && !this._node.stop) {
            const stop = NodeStopFactory.createNewStop();
            (this._node as any)[property] = stop;
            this._stopValidationStore.init(stop, stopValidationModel);
        }
    };

    @action
    public updateStopProperty = (property: string, value?: string | number | Date) => {
        if (!this.node) return;
        this._node!.stop![property] = value;
        this._stopValidationStore.updateProperty(property, value);
    };

    @action
    public setIsEditingDisabled = (isEditingDisabled: boolean) => {
        this._isEditingDisabled = isEditingDisabled;
    };

    @action
    public toggleIsEditingDisabled = () => {
        this._isEditingDisabled = !this._isEditingDisabled;
    };

    @action
    public setCurrentStateIntoNodeCache = ({ isNewNode }: { isNewNode: boolean }) => {
        const nodeId = this._node!.id;
        const nodeCacheObj = {
            node: _.cloneDeep(this._node!),
            links: _.cloneDeep(this._links),
            oldNode: _.cloneDeep(this._oldNode!),
            oldLinks: _.cloneDeep(this._oldLinks),
            isNodeIdEditable: this._isNodeIdEditable
        };
        if (isNewNode) {
            this._nodeCache.newNodeCache = nodeCacheObj;
        } else {
            this._nodeCache[nodeId] = nodeCacheObj;
        }
    };

    @action
    public clearNodeCache = () => {
        this._nodeCache = {
            newNodeCache: null
        };
    };

    @action
    public setStopAreaItems = (stopAreaItems: IStopAreaItem[]) => {
        this._stopAreaItems = stopAreaItems;
    };

    @action
    public setIsNodeIdEditable = (isEditable: boolean) => {
        this._isNodeIdEditable = isEditable;
    };

    @action
    public clear = () => {
        this._links = [];
        this._node = null;
        this._oldNode = null;
        this._oldLinks = [];
        this._geometryUndoStore.clear();
        this._nodeValidationStore.clear();
        this._stopValidationStore.clear();
        this._isEditingDisabled = true;
    };

    @action
    public resetChanges = () => {
        if (this._oldNode) {
            this.init({ node: this._oldNode, links: this._oldLinks, isNewNode: false });
        }
    };

    @action
    public undo = () => {
        this._geometryUndoStore.undo((previousUndoState: UndoState) => {
            this._links! = previousUndoState.links;
            this.updateNodeProperty('coordinates', previousUndoState.node.coordinates);
            this.updateNodeProperty(
                'coordinatesProjection',
                previousUndoState.node.coordinatesProjection
            );
        });
    };

    @action
    public redo = () => {
        this._geometryUndoStore.redo((nextUndoState: UndoState) => {
            this._links! = nextUndoState.links;
            this.updateNodeProperty('coordinates', nextUndoState.node.coordinates);
            this.updateNodeProperty(
                'coordinatesProjection',
                nextUndoState.node.coordinatesProjection
            );
        });
    };

    @action
    private onStopAreaChange = (stopAreaId: string) => {
        this.updateStopArea(stopAreaId);
    };

    @action
    private onStopAreaItemsChange = () => {
        const stopAreaId = this.node && this.node.stop && this.node.stop.stopAreaId;
        if (stopAreaId) {
            this.updateStopArea(stopAreaId);
        }
    };

    @action
    private updateStopArea = (stopAreaId?: string) => {
        if (!this._stopAreaItems) return;

        this.updateStopProperty('stopAreaId', stopAreaId);
        if (!stopAreaId) return;

        const stopAreaItem = this._stopAreaItems.find(obj => {
            return obj.pysalueid === stopAreaId;
        });
        if (stopAreaItem) {
            this.updateStopProperty('nameFi', stopAreaItem.nimi);
            this.updateStopProperty('nameSw', stopAreaItem.nimir);
        }
    };

    public getDirtyLinks() {
        // All links are dirty if the node coordinate has changed
        if (!_.isEqual(this._node!.coordinatesProjection, this._oldNode!.coordinatesProjection)) {
            return this._links;
        }
        return this._links.filter(link => {
            const oldLink = this._oldLinks.find(
                oldLink =>
                    oldLink.transitType === link.transitType &&
                    oldLink.startNode.id === link.startNode.id &&
                    oldLink.endNode.id === link.endNode.id
            );
            return !_.isEqual(link, oldLink);
        });
    }

    public getNodeCacheObjById(nodeId: string): INodeCacheObj | null {
        return this._nodeCache[nodeId];
    }

    public getNewNodeCacheObj(): INodeCacheObj | null {
        return this._nodeCache.newNodeCache;
    }

    private onChangeIsEditingDisabled = () => {
        if (this._isEditingDisabled) {
            this.resetChanges();
        } else {
            this._nodeValidationStore.validateAllProperties();
            this._stopValidationStore.validateAllProperties();
        }
    };
}

const observableNodeStore = new NodeStore();

export default observableNodeStore;

export { NodeStore, INodeCacheObj };
