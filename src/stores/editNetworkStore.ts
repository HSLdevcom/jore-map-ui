import { action, computed, observable } from 'mobx';
import { ILink, INode } from '~/models';

export class EditNetworkStore {
    @observable private _links: ILink[];
    @observable private _node: INode | null;

    constructor() {
        this._links = [];
    }

    @computed
    get links(): ILink[] {
        return this._links;
    }

    @computed
    get node(): INode | null {
        return this._node;
    }

    @action
    public setLinks = (links: ILink[]) => {
        this._links = links;
    }

    @action
    public setNode = (node: INode) => {
        this._node = node;
    }

    @action
    public clear = () => {
        this._links = [];
        this._node = null;
    }
}

const observableStoreStore = new EditNetworkStore();

export default observableStoreStore;
