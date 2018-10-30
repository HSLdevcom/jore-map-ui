import { action, computed, observable } from 'mobx';
import { ICoordinate } from '~/models';
import NodeService from '~/services/nodeService';

export interface INewRoutePathNode {
    nodeId: string;
    coordinates: ICoordinate;
}

export class NewRoutePathStore {
    @observable private _isCreating: boolean;
    @observable private _nodes: INewRoutePathNode[];
    @observable private _neighborNodes: INewRoutePathNode[];

    constructor() {
        this._nodes = [];
        this._neighborNodes = [];
    }

    @computed
    get isCreating(): boolean {
        return this._isCreating;
    }

    @computed
    get nodes(): INewRoutePathNode[] {
        return this._nodes;
    }

    @computed
    get neighborNodes(): INewRoutePathNode[] {
        return this._neighborNodes;
    }

    @action
    setIsCreating(value: boolean) {
        this._isCreating = value;
    }

    @action
    addNode(node: INewRoutePathNode, preventUpdate?: boolean) {
        if (this.nodes.includes(node)) return;

        this._nodes.push(node);
        this.updateNeighborNodes();
    }

    @action
    addNeighborNodes(nodes: INewRoutePathNode[]) {
        this._neighborNodes = nodes;
    }

    async updateNeighborNodes() {
        const lastNode = this._nodes[this._nodes.length - 1];
        const neighborNodes: INewRoutePathNode[]|null
            = await NodeService.fetchNodesWithRoutePathLinkStartNodeId(lastNode.nodeId);

        if (neighborNodes) {
            this.addNeighborNodes(neighborNodes);
        }
    }
}

const observableStoreStore = new NewRoutePathStore();

export default observableStoreStore;
