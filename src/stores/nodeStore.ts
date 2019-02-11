import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { ILink, INode } from '~/models';
import { LatLng } from 'leaflet';

export class NodeStore {
    @observable private _links: ILink[];
    @observable private _node: INode | null;
    @observable private _oldNode: INode | null;

    constructor() {
        this._links = [];
        this._node = null;
        this._oldNode = null;
    }

    @computed
    get links() {
        return this._links;
    }

    @computed
    get node() {
        return this._node!;
    }

    @action
    public setLinks = (links: ILink[]) => {
        this._links = links;
    }

    @action
    public setNode = (node: INode) => {
        this._node = node;
        this.setOldNode(node);
    }

    @action
    public setOldNode = (node: INode) => {
        this._oldNode = _.cloneDeep(node);
    }

    @action
    public updateNode = (property: string, value: string|number|Date|LatLng) => {
        this._node = {
            ...this._node!,
            [property]: value,
        };
    }

    @action
    public updateStop = (property: string, value: string|number|Date) => {
        this._node!.stop = {
            ...this._node!.stop!,
            [property]: value,
        };
    }

    @computed
    get isDirty() {
        return !_.isEqual(this._node, this._oldNode);
    }

    @action
    public clear = () => {
        this._links = [];
        this._node = null;
        this._oldNode = null;
    }

    @action
    public undoChanges = () => {
        if (this._oldNode) {
            this.setNode(this._oldNode);
        }
    }
}

const observableNodeStore = new NodeStore();

export default observableNodeStore;
