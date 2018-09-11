import { computed, observable, action } from 'mobx';
import { INode, IRoutePath } from '../models';
import RoutesViewHelper from '../util/routesViewHelper';

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

    public getNodes(nodeIds: number[]) {
        return this._nodes.filter(node => nodeIds.indexOf(node.id) > -1);
    }

    public getNodesUsedInRoutePaths(routePaths: IRoutePath[]) {
        return this._nodes.filter(node =>
            RoutesViewHelper.routePathHasStop(routePaths, node.id),
        );
    }

    @action
    public addToNodes(node: INode) {
        this._nodes.push(node);
    }

    @action
    public removeFromNodes(nodeId: number) {
        for (let i = 0; i < this._nodes.length; i += 1) {
            if (this._nodes[i].id === nodeId) {
                this._nodes.splice(i, 1);
            }
        }
    }
}

const observableNodeStore = new NodeStore();

export default observableNodeStore;
