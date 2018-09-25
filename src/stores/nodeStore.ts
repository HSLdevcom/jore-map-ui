import { computed, observable, action } from 'mobx';
import { INode, IRoutePath } from '../models';
import NodeHelper from '../util/nodeHelper';

export class NodeStore {
    @observable private _nodes: INode[];

    constructor() {
        this._nodes = [];
    }

    @computed get nodes(): INode[] {
        return this._nodes;
    }

    set nodes(value: INode[]) {
        this._nodes = value;
    }

    @action
    public getNode(nodeId: number): INode | undefined {
        return this._nodes.find(node => node.id === nodeId);
    }

    public getNodesUsedInRoutePaths(routePaths: IRoutePath[]) {
        const requiredRoutePathIds = NodeHelper.getNodeIdsUsedByRoutePaths(routePaths);
        return this._nodes.filter(node =>
            requiredRoutePathIds.some(rPathId => node.id === rPathId),
        );
    }

    @action
    public addNode(node: INode) {
        this._nodes.push(node);
    }

    @action
    public addNodes(nodes: INode[]) {
        this._nodes.push(...nodes);
    }

    @action
    public removeFromNodes(nodeIds: number[]) {
        this._nodes = this._nodes.filter(node => !nodeIds.includes(node.id));
    }
}

const observableNodeStore = new NodeStore();

export default observableNodeStore;
