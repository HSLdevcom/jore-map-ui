import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { ILink, INode } from '~/models';
import { LatLng } from 'leaflet';
import NodeType from '~/enums/nodeType';
import NodeLocationType from '~/types/NodeLocationType';
import StopFactory from '~/factories/nodeStopFactory';
import UndoStore from '~/stores/undoStore';

export interface UndoObject {
    links: ILink[];
    node: INode;
}

export class NodeStore {
    @observable private _links: ILink[];
    @observable private _node: INode | null;
    @observable private _oldNode: INode | null;
    private _undoStore: UndoStore<UndoObject>;

    constructor() {
        this._links = [];
        this._node = null;
        this._oldNode = null;
        this._undoStore = new UndoStore();
    }

    @computed
    get links() {
        return this._links;
    }

    @computed
    get node() {
        return this._node!;
    }

    @action
    public init = (node: INode, links: ILink[]) => {
        if (!node) return;
        this.setNode(node);
        this._links = links;

        const undoObject: UndoObject = {
            links,
            node,
        };
        this._undoStore.addUndoObject(undoObject);
    }

    @action
    public setNode = (node: INode) => {
        this._node = node;
        this.setOldNode(node);
    }

    @action
    public setOldNode = (node: INode) => {
        this._oldNode = _.cloneDeep(node);
    }

    @action
    public changeLinkGeometry = (latLngs: L.LatLng[], index: number) => {
        if (!this._node) return;

        const newLinks = _.cloneDeep(this._links);
        newLinks[index].geometry = latLngs;
        const undoObject: UndoObject = {
            links: newLinks,
            node: this._node,
        };
        this._undoStore.addUndoObject(undoObject);

        this._links = newLinks;
    }

    @action
    public updateNodeGeometry = (nodeLocationType: NodeLocationType, newCoordinates: LatLng) => {
        if (!this._node) return;

        const newNode = _.cloneDeep(this._node);
        const newLinks = _.cloneDeep(this._links);

        newNode[nodeLocationType] = newCoordinates;
        if (newNode.type !== NodeType.STOP && nodeLocationType === 'coordinates') {
            newNode.coordinatesProjection = newNode.coordinates;
            newNode.coordinatesManual = newNode.coordinates;
        }

        const coordinatesProjection = newNode.coordinatesProjection;
        // Update the first link geometry of startNodes to coordinatesProjection
        newLinks
            .filter(link => link.startNode.id === newNode!.id)
            .map(link => link.geometry[0] = coordinatesProjection);
        // Update the last link geometry of endNodes to coordinatesProjection
        newLinks
            .filter(link => link.endNode.id === newNode!.id)
            .map(link => link.geometry[link.geometry.length - 1] = coordinatesProjection);

        const undoObject: UndoObject = {
            links: newLinks,
            node: newNode,
        };
        this._undoStore.addUndoObject(undoObject);

        this._links = newLinks;
        this._node = newNode;
    }

    @action
    public updateNode = (property: string, value: string|number|Date|LatLng) => {
        this._node = {
            ...this._node!,
            [property]: value,
        };

        if (this._node.type === NodeType.STOP && !this._node.stop) {
            this._node.stop = StopFactory.createNewStop();
        }
    }

    @action
    public updateStop = (property: string, value: string|number|Date) => {
        this._node!.stop = {
            ...this._node!.stop!,
            [property]: value,
        };
    }

    @computed
    get isDirty() {
        return !_.isEqual(this._node, this._oldNode);
    }

    @action
    public clear = () => {
        this._links = [];
        this._node = null;
        this._oldNode = null;
    }

    @action
    public undoChanges = () => {
        if (this._oldNode) {
            this.setNode(this._oldNode);
        }
    }

    @action
    public undo = () => {
        this._undoStore.undo((undoObject: UndoObject) => {
            this._links! = undoObject.links;
            this._node!.coordinates = undoObject.node.coordinates;
            this._node!.coordinatesManual = undoObject.node.coordinatesManual;
            this._node!.coordinatesProjection = undoObject.node.coordinatesProjection;
        });
    }

    @action
    public redo = () => {
        this._undoStore.redo((undoObject: UndoObject) => {
            this._links! = undoObject.links;
            this._node!.coordinates = undoObject.node.coordinates;
            this._node!.coordinatesManual = undoObject.node.coordinatesManual;
            this._node!.coordinatesProjection = undoObject.node.coordinatesProjection;
        });
    }
}

const observableNodeStore = new NodeStore();

export default observableNodeStore;
