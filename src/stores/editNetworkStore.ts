import { action, computed, observable } from 'mobx';
import { ILink, INode } from '~/models';

export class EditNetworkStore {
    @observable private _links: ILink[];
    @observable private _nodes: INode[];

    constructor() {
        this._links = [];
        this._nodes = [];
    }

    @computed
    get links(): ILink[] {
        return this._links;
    }

    @computed
    get nodes(): INode[] {
        return this._nodes;
    }

    @action
    public setLinks = (links: ILink[]) => {
        this._links = links;
    }

    @action
    public setNodes = (nodes: INode[]) => {
        this._nodes = nodes;
    }

    @action
    public updateNode = (node: INode) => {
        this.setNodes([...this.nodes.filter(n => n.id !== node.id), node]);
    }

    @action
    public clear = () => {
        this._links = [];
        this._nodes = [];
    }
}

const observableStoreStore = new EditNetworkStore();

export default observableStoreStore;
