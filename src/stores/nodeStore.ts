import { computed, observable, action } from 'mobx';
import { INode } from '~/models';

export class NodeStore {
    @observable private _nodes: INode[];
    @observable private _selectedNodeId: string|null;
    @observable private _disabledNodeIds: string[];
    @observable private _timeAlignmentNodeIds: string[];

    constructor() {
        this._nodes = [];
        this._disabledNodeIds = [];
        this._timeAlignmentNodeIds = [];
        this._selectedNodeId = null;
    }

    @computed get nodes(): INode[] {
        return this._nodes;
    }

    set nodes(value: INode[]) {
        this._nodes = value;
    }

    @computed get disabledNodeIds(): string[] {
        return this._disabledNodeIds;
    }

    @computed get timeAlignmentNodeIds(): string[] {
        return this._timeAlignmentNodeIds;
    }

    @action
    public setDisabledNodeIds(nodes: string[]) {
        this._disabledNodeIds = nodes;
    }

    @action
    public setTimeAlignmentNodeIds(nodes: string[]) {
        this._timeAlignmentNodeIds = nodes;
    }

    @computed get selectedNodeId(): string|null {
        return this._selectedNodeId;
    }

    set selectedNodeId(nodeId: string|null) {
        this._selectedNodeId = nodeId;
    }

    public isNodeDisabled(nodeId: string): boolean {
        return (this._disabledNodeIds.includes(nodeId));
    }

    public isNodeTimeAlignmentStop(nodeId: string): boolean {
        return (this._timeAlignmentNodeIds.includes(nodeId));
    }

    @action
    public getNode(nodeId: string): INode | null {
        const node = this._nodes.find(node => node.id === nodeId);
        if (node) return node;
        return null;
    }

    /**
     * Adds a node or replaces existing node
     * @param {INode} node - node to add or replace with
     */
    @action
    public addNode(node: INode) {
        const nodeIndex = this._nodes.findIndex(_node => _node.id === node.id);
        if (nodeIndex === -1) {
            this._nodes.push(node);
        } else {
            this._nodes[nodeIndex] = node;
        }
    }

    @action
    public addNodes(nodes: INode[]) {
        this._nodes.push(...nodes);
    }

    @action
    public removeFromNodes(nodeIds: string[]) {
        this._nodes = this._nodes.filter(node => !nodeIds.includes(node.id));
    }

}

const observableNodeStore = new NodeStore();

export default observableNodeStore;
