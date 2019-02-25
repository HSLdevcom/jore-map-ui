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
    @observable private _oldLinks: ILink[];
    private _undoStore: UndoStore<UndoObject>;

    constructor() {
        this._links = [];
        this._node = null;
        this._oldNode = null;
        this._oldLinks = [];
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
        const newNode = _.cloneDeep(node);
        const newLinks = _.cloneDeep(links);

        this._undoStore.clear();
        const undoObject: UndoObject = {
            links: newLinks,
            node: newNode,
        };
        this._undoStore.addUndoObject(undoObject);

        this._node = newNode;
        this._oldNode = newNode;
        this._links = newLinks;
        this._oldLinks = newLinks;
    }

    @action
    public changeLinkGeometry = (latLngs: L.LatLng[], index: number) => {
        if (!this._node) throw new Error('Node was null'); // Sanity check

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
        if (!this._node) throw new Error('Node was null'); // Sanity check

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
        return !_.isEqual(this._node, this._oldNode) || !_.isEqual(this._links, this._oldLinks);
    }

    @action
    public clear = () => {
        this._links = [];
        this._node = null;
        this._oldNode = null;
    }

    @action
    public resetChanges = () => {
        if (this._oldNode) {
            this.init(this._oldNode, this._oldLinks);
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
