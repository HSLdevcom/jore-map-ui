import { action, computed, observable } from 'mobx';
import { ILink, INode } from '~/models';

export class NodeStore {
    @observable private _links: ILink[];
    @observable private _node: INode | null;
    @observable private _hasUnsavedModifications: boolean;

    constructor() {
        this._links = [];
        this._hasUnsavedModifications = false;
        this._node = null;
    }

    @computed
    get links() {
        return this._links;
    }

    @computed
    get node() {
        return this._node!;
    }

    @computed
    get hasUnsavedModifications() {
        return this._hasUnsavedModifications!;
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
    public updateNode = (property: string, value: string|number|Date) => {
        this._node = {
            ...this._node!,
            [property]: value,
        };
        this._hasUnsavedModifications = true;
    }

    @action
    public updateStop = (property: string, value: string|number|Date) => {
        this._node!.stop = {
            ...this._node!.stop!,
            [property]: value,
        };
        this._hasUnsavedModifications = true;
    }

    @action
    public clear = () => {
        this._links = [];
        this._node = null;
    }

    @action
    public resetHaveLocalModifications = () => {
        this._hasUnsavedModifications = false;
    }
}

const observableNodeStore = new NodeStore();

export default observableNodeStore;
