import { computed, observable, action } from 'mobx';
import { INode, IRoutePath } from '../models';
import NodeHelper from '../util/nodeHelper';

export class NodeStore {
    @observable private _nodes: INode[];
    @observable private _selectedNodeId: string|null;

    constructor() {
        this._nodes = [];
        this._selectedNodeId = null;
    }

    @computed get nodes(): INode[] {
        return this._nodes;
    }

    set nodes(value: INode[]) {
        this._nodes = value;
    }

    @computed get selectedNodeId(): string|null {
        return this._selectedNodeId;
    }

    set selectedNodeId(nodeId: string|null) {
        this._selectedNodeId = nodeId;
    }

    @action
    public getNode(nodeId: string): INode | null {
        const node = this._nodes.find(node => node.id === nodeId);
        if (node) return node;
        return null;
    }

    public getNodesUsedInRoutePaths(routePaths: IRoutePath[]) {
        const requiredRoutePathIds = NodeHelper.getNodeIdsUsedByRoutePaths(routePaths);
        return this._nodes.filter(node =>
            requiredRoutePathIds.some(rPathId => node.id === rPathId),
        );
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
