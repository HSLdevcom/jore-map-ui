import { computed, observable, action } from 'mobx';
import { INode, IRoutePath } from '~/models';
import NodeHelper from '~/util/nodeHelper';

export class NodeStore {
    @observable private _nodes: INode[];
    @observable private _selectedNodeId: string|null;
    @observable private _disabledNodeIds: string[];

    constructor() {
        this._nodes = [];
        this._disabledNodeIds = [];
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

    @action
    public setDisabledNodeIds(nodes: string[]) {
        this._disabledNodeIds = nodes;
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

    @action
    public getNodesUsedInRoutePaths(routePaths: IRoutePath[]) {
        const requiredRoutePathIds = NodeHelper.getNodeIdsUsedByRoutePaths(routePaths);
        const nodes = this._nodes.filter(node =>
            requiredRoutePathIds.some(rPathId => node.id === rPathId),
        );
        nodes.forEach((node) => {
            (this._disabledNodeIds.includes(node.id)) ?
                node.disabled = true : node.disabled = false;
        });
        return nodes;
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
