import { LatLng } from 'leaflet';
import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import NodeMeasurementType from '~/enums/nodeMeasurementType';
import NodeType from '~/enums/nodeType';
import NodeStopFactory from '~/factories/nodeStopFactory';
import { ILink, INode } from '~/models';
import GeocodingService from '~/services/geocodingService';
import { IStopAreaItem } from '~/services/stopAreaService';
import GeometryUndoStore from '~/stores/geometryUndoStore';
import NodeLocationType from '~/types/NodeLocationType';
import { roundLatLng, roundLatLngs } from '~/util/geomHelpers';
import NetworkStore from './networkStore';

interface UndoState {
    node: INode;
    links: ILink[];
}

interface INodeCacheObj {
    node: INode;
    oldNode: INode;
    links: ILink[];
    oldLinks: ILink[];
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
    @observable private _isStopFormValid: boolean;
    @observable private _isEditingDisabled: boolean;
    @observable private _nodeCache: INodeCache;
    @observable private _stopAreaItems: IStopAreaItem[];
    private _geometryUndoStore: GeometryUndoStore<UndoState>;

    constructor() {
        this._links = [];
        this._node = null;
        this._oldNode = null;
        this._oldLinks = [];
        this._geometryUndoStore = new GeometryUndoStore();
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
    get isStopFormValid() {
        return this._isStopFormValid;
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
        geometryVariables.forEach(
            coordinateName => (this._node![coordinateName] = newNode[coordinateName])
        );

        if (nodeLocationType === 'coordinates') {
            this.updateNode('measurementType', measurementType.toString());
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
        this.updateStop('addressFi', addressFi);
        this.updateStop('addressSw', addressSw);
        this.updateStop('postalNumber', postalNumber);
    };

    @action
    public updateNode = (property: keyof INode, value: string | Date | LatLng) => {
        if (!this._node) return;

        this._node[property] = value;

        if (property === 'type') this.mirrorCoordinates(this._node);

        if (this._node.type === NodeType.STOP && !this._node.stop) {
            this._node.stop = NodeStopFactory.createNewStop();
        }
    };

    @action
    public updateStop = (property: string, value?: string | number | Date) => {
        if (!this.node) return;
        this._node!.stop = {
            ...this._node!.stop!,
            [property]: value
        };
    };

    @action
    public setIsStopFormValid = (isStopFormValid: boolean) => {
        this._isStopFormValid = isStopFormValid;
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
            oldLinks: _.cloneDeep(this._oldLinks)
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
    public clear = () => {
        this._links = [];
        this._node = null;
        this._oldNode = null;
        this._oldLinks = [];
        this._geometryUndoStore.clear();
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
            this._node!.coordinates = previousUndoState.node.coordinates;
            this._node!.coordinatesProjection = previousUndoState.node.coordinatesProjection;
        });
    };

    @action
    public redo = () => {
        this._geometryUndoStore.redo((nextUndoState: UndoState) => {
            this._links! = nextUndoState.links;
            this._node!.coordinates = nextUndoState.node.coordinates;
            this._node!.coordinatesProjection = nextUndoState.node.coordinatesProjection;
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

        this.updateStop('stopAreaId', stopAreaId);
        if (!stopAreaId) return;

        const stopAreaItem = this._stopAreaItems.find(obj => {
            return obj.pysalueid === stopAreaId;
        });
        if (stopAreaItem) {
            this.updateStop('nameFi', stopAreaItem.nimi);
            this.updateStop('nameSw', stopAreaItem.nimir);
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
}

const observableNodeStore = new NodeStore();

export default observableNodeStore;

export { NodeStore, INodeCacheObj };
