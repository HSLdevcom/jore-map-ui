import { action, computed, observable } from 'mobx';
import { ICoordinate } from '~/models';

interface INewRoutePathNode {
    id: String;
    coordinates: ICoordinate;
}

export class NewRoutePathStore {
    @observable private _nodes: INewRoutePathNode[];

    constructor() {
        this._nodes = [];
    }

    @computed
    get nodes(): INewRoutePathNode[] {
        return this._nodes;
    }

    @action
    addNode(node: INewRoutePathNode) {
        this._nodes.push(node);
    }
}

const observableStoreStore = new NewRoutePathStore();

export default observableStoreStore;
