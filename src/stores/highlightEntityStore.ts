import { action, computed, observable } from 'mobx';
import { INodeMapHighlight } from '~/models/INode';

export class HighlightEntityStore {
    @observable private _nodes: INodeMapHighlight[];

    constructor() {
        this._nodes = [];
    }

    @computed
    get nodes() {
        return this._nodes;
    }

    @action
    public setNodes(nodes: INodeMapHighlight[]) {
        this._nodes = nodes;
    }
}

const observableLineHeaderStore = new HighlightEntityStore();

export default observableLineHeaderStore;
