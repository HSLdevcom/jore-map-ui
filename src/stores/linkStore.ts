import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { ILink, INode } from '~/models';
import { LatLng } from 'leaflet';

export class LinkStore {
    @observable private _link: ILink | null;
    @observable private _oldLink: ILink | null;
    @observable private _nodes: INode[];

    constructor() {
        this._nodes = [];
        this._link = null;
        this._oldLink = null;
    }

    @computed
    get link() {
        return this._link;
    }

    @computed
    get nodes() {
        return this._nodes;
    }

    @action
    public setLink = (link: ILink) => {
        this._link = link;
        this.setOldLink(link);
    }

    @action
    public setNodes = (nodes: INode[]) => {
        this._nodes = nodes;
    }

    @action
    public setOldLink = (link: ILink) => {
        this._oldLink = _.cloneDeep(link);
    }

    @action
    public updateLink = (property: string, value: string|number|Date|LatLng[]) => {
        this._link = {
            ...this._link!,
            [property]: value,
        };
    }

    @action
    public clear = () => {
        this._link = null;
        this._nodes = [];
        this._oldLink = null;
    }

    @computed
    get isDirty() {
        return !_.isEqual(this._link, this._oldLink);
    }

    @action
    public undoChanges = () => {
        if (this._oldLink) {
            this.setLink(this._oldLink);
        }
    }
}

const observableLinkStore = new LinkStore();

export default observableLinkStore;
