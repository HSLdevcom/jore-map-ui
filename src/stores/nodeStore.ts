import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { ILink, INode } from '~/models';
import { LatLng } from 'leaflet';
import NodeType from '~/enums/nodeType';
import NodeLocationType from '~/types/NodeLocationType';
import NodeStopFactory from '~/factories/nodeStopFactory';
import UndoStore from '~/stores/undoStore';
import { roundLatLng } from '~/util/geomHelper';

export interface UndoState {
    links: ILink[];
    node: INode;
}

export class NodeStore {
    @observable private _links: ILink[];
    @observable private _node: INode | null;
    @observable private _oldNode: INode | null;
    @observable private _oldLinks: ILink[];
    private _undoStore: UndoStore<UndoState>;

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
    get dirtyLinks() {
        // All links are dirty if the node coordinate has changed
        if (!_.isEqual(
            this._node!.coordinatesProjection,
            this._oldNode!.coordinatesProjection,
        )) {
            return this._links;
        }
        return this._links.filter((link) => {
            const oldLink = this._oldLinks.find(oldLink =>
                oldLink.transitType === link.transitType &&
                oldLink.startNode.id === link.startNode.id &&
                oldLink.endNode.id === link.endNode.id,
            );
            return !_.isEqual(link, oldLink);
        });
    }

    @computed
    get node() {
        return this._node!;
    }

    @action
    public init = (node: INode, links: ILink[]) => {
        const newNode = _.cloneDeep(node);
        const newLinks = _.cloneDeep(links);

        this.clear();
        const currentUndoState: UndoState = {
            links: newLinks,
            node: newNode,
        };
        this._undoStore.addItem(currentUndoState);

        this._node = newNode;
        this._oldNode = newNode;
        this._links = newLinks;
        this._oldLinks = newLinks;
    }

    @action
    public setCurrentStateAsOld = () => {
        this._oldLinks = _.cloneDeep(this._links);
        this._oldNode = _.cloneDeep(this._node);
    }

    @action
    public changeLinkGeometry = (latLngs: L.LatLng[], index: number) => {
        if (!this._node) throw new Error('Node was null.'); // Should not occur

        const newLinks = _.cloneDeep(this._links);
        newLinks[index].geometry = latLngs;
        const currentUndoState: UndoState = {
            links: newLinks,
            node: this._node,
        };
        this._undoStore.addItem(currentUndoState);

        this._links = newLinks;
    }

    @action
    public updateNodeGeometry = (nodeLocationType: NodeLocationType, newCoordinates: LatLng) => {
        if (!this._node) throw new Error('Node was null.'); // Should not occur

        const newNode = _.cloneDeep(this._node);
        const newLinks = _.cloneDeep(this._links);

        newNode[nodeLocationType] = roundLatLng(newCoordinates);

        if (nodeLocationType === 'coordinates') this.mirrorCoordinates(newNode);

        const coordinatesProjection = newNode.coordinatesProjection;
        // Update the first link geometry of startNodes to coordinatesProjection
        newLinks
            .filter(link => link.startNode.id === newNode!.id)
            .map(link => link.geometry[0] = coordinatesProjection);
        // Update the last link geometry of endNodes to coordinatesProjection
        newLinks
            .filter(link => link.endNode.id === newNode!.id)
            .map(link => link.geometry[link.geometry.length - 1] = coordinatesProjection);

        const currentUndoState: UndoState = {
            links: newLinks,
            node: newNode,
        };
        this._undoStore.addItem(currentUndoState);

        this._links = newLinks;
        this._node = newNode;
    }

    @action
    public mirrorCoordinates = (node: INode) => {
        if (node.type !== NodeType.STOP) {
            node.coordinatesProjection = node.coordinates;
            node.coordinatesManual = node.coordinates;
        }
    }

    @action
    public updateNode = (property: string, value: string|number|Date|LatLng) => {
        if (!this._node) return;

        this._node[property] = value;

        if (property === 'type') this.mirrorCoordinates(this._node);

        if (this._node.type === NodeType.STOP && !this._node.stop) {
            this._node.stop = NodeStopFactory.createNewStop();
        }
    }

    @action
    public updateStop = (property: string, value: string|number|Date) => {
        if (!this.node) return;

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
        this._undoStore.clear();
    }

    @action
    public resetChanges = () => {
        if (this._oldNode) {
            this.init(this._oldNode, this._oldLinks);
        }
    }

    @action
    public undo = () => {
        this._undoStore.undo((previousUndoState: UndoState) => {
            this._links! = previousUndoState.links;
            this._node!.coordinates = previousUndoState.node.coordinates;
            this._node!.coordinatesManual = previousUndoState.node.coordinatesManual;
            this._node!.coordinatesProjection = previousUndoState.node.coordinatesProjection;
        });
    }

    @action
    public redo = () => {
        this._undoStore.redo((nextUndoState: UndoState) => {
            this._links! = nextUndoState.links;
            this._node!.coordinates = nextUndoState.node.coordinates;
            this._node!.coordinatesManual = nextUndoState.node.coordinatesManual;
            this._node!.coordinatesProjection = nextUndoState.node.coordinatesProjection;
        });
    }
}

const observableNodeStore = new NodeStore();

export default observableNodeStore;
