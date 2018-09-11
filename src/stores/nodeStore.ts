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
        const requiredRoutePathIds = RoutesViewHelper.getNodeIdsUsedByRoutePaths(routePaths);
        return this._nodes.filter(node =>
            requiredRoutePathIds.some(rPathId => node.id === rPathId),
        );
    }

    @action
    public addToNodes(nodes: INode[]) {
        this._nodes.push(...nodes);
    }

    @action
    public removeFromNodes(nodeIds: number[]) {
        this._nodes.forEach((node, index) => {
            if (nodeIds.indexOf(node.id) > -1) {
                this._nodes.splice(index, 1);
            }
        });
    }
}

const observableNodeStore = new NodeStore();

export default observableNodeStore;
