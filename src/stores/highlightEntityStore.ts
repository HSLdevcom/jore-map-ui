import { action, computed, observable } from 'mobx';
import { ILinkMapHighlight } from '~/models/ILink';
import { INodeMapHighlight } from '~/models/INode';

export class HighlightEntityStore {
    @observable private _nodes: INodeMapHighlight[];
    @observable private _links: ILinkMapHighlight[];

    constructor() {
        this._nodes = [];
        this._links = [];
    }

    @computed
    get nodes() {
        return this._nodes;
    }

    @computed
    get links() {
        return this._links;
    }

    @action
    public setNodes(nodes: INodeMapHighlight[]) {
        this._nodes = nodes;
    }

    @action
    public setLinks(links: ILinkMapHighlight[]) {
        this._links = links;
    }
}

const observableLineHeaderStore = new HighlightEntityStore();

export default observableLineHeaderStore;
