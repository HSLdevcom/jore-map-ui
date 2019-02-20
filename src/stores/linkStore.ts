import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { ILink, INode } from '~/models';
import { LatLng } from 'leaflet';

export interface UndoObject {
    link: ILink;
}

export class LinkStore {
    @observable private _link: ILink | null;
    @observable private _oldLink: ILink | null;
    @observable private _nodes: INode[];
    @observable private _undoObjects: UndoObject[];
    @observable private _undoIndex: number;

    constructor() {
        this._nodes = [];
        this._link = null;
        this._oldLink = null;
        this._undoObjects = [];
        this._undoIndex = 0;
    }

    @computed
    get link() {
        return this._link!;
    }

    @computed
    get nodes() {
        return this._nodes;
    }

    @action
    public setLink = (link: ILink) => {
        this._link = link;
        this._undoObjects = [{
            link,
        }];
        this._undoIndex = 0;
        this.setOldLink(link);
    }

    @action
    public updateLinkGeometry = (latLngs: L.LatLng[]) => {
        if (!this._link) return;

        const updatedLink = _.cloneDeep(this._link);
        updatedLink.geometry = latLngs;

        const currentUndoObject: UndoObject = {
            link: updatedLink,
        };

        // Remove the history of undo's because current state is changed
        this._undoObjects.splice(this._undoIndex + 1);

        // Insert current undoObject to the pile
        this._undoObjects = this._undoObjects.concat([currentUndoObject]);
        this._undoIndex += 1;

        this._link = updatedLink;
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
    public updateLinkProperty = (property: string, value: string|number|Date|LatLng[]) => {
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
        return this._link && !_.isEqual(
            {
                ...this.link,
                // Remapping geometry since edit initialization has added handlers
                geometry: this.link!.geometry
                    .map(coor => new LatLng(coor.lat, coor.lng)),
            },
            this._oldLink,
        );
    }

    @action
    public undoChanges = () => {
        if (this._oldLink) {
            this.setLink(this._oldLink);
        }
    }

    @action
    public undo = () => {
        if (!this._link || this._undoIndex <= 0) {
            return;
        }
        const previousUndoObject = this._undoObjects[this._undoIndex - 1];
        this._link.geometry = _.cloneDeep(previousUndoObject.link.geometry);
        this._undoIndex -= 1;
    }

    @action
    public redo = () => {
        if (!this._link
            || this._undoObjects.length <= 1
            || this._undoIndex >= this._undoObjects.length - 1) {
            return;
        }
        const nextUndoObject = this._undoObjects[this._undoIndex + 1];
        this._link.geometry = _.cloneDeep(nextUndoObject.link.geometry);
        this._undoIndex += 1;
    }
}

const observableLinkStore = new LinkStore();

export default observableLinkStore;
