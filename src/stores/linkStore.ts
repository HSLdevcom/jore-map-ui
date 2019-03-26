import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { ILink, INode } from '~/models';
import { LatLng } from 'leaflet';
import UndoStore from '~/stores/undoStore';

export interface UndoState {
    link: ILink;
}

export class LinkStore {
    @observable private _link: ILink | null;
    @observable private _oldLink: ILink | null;
    @observable private _nodes: INode[];
    // variable for creating new link:
    @observable private _startMarkerCoordinates: LatLng | null;
    private _undoStore: UndoStore<UndoState>;

    constructor() {
        this._nodes = [];
        this._link = null;
        this._oldLink = null;
        this._startMarkerCoordinates = null;
        this._undoStore = new UndoStore();
    }

    @computed
    get link() {
        return this._link!;
    }

    @computed
    get nodes() {
        return this._nodes;
    }

    @computed
    get startMarkerCoordinates() {
        return this._startMarkerCoordinates;
    }

    @action
    public init = (link: ILink, nodes: INode[]) => {
        this.setLink(link);
        this.setNodes(nodes);
    }

    @action
    public setLink = (link: ILink) => {
        this._link = link;
        const currentUndoState: UndoState = {
            link,
        };
        this._undoStore.addItem(currentUndoState);

        this.setOldLink(link);
    }

    @action
    public updateLinkGeometry = (latLngs: L.LatLng[]) => {
        if (!this._link) return;

        const updatedLink = _.cloneDeep(this._link);
        updatedLink.geometry = latLngs;
        this._link = updatedLink;

        const currentUndoState: UndoState = {
            link: updatedLink,
        };
        this._undoStore.addItem(currentUndoState);

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
    public setStartMarkerCoordinates = (startMarkerCoordinates: LatLng | null) => {
        this._startMarkerCoordinates = startMarkerCoordinates;
    }

    @action
    public clear = () => {
        this._link = null;
        this._nodes = [];
        this._oldLink = null;
        this._startMarkerCoordinates = null;
        this._undoStore.clear();
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
        this._undoStore.undo((previousUndoState: UndoState) => {
            this._link!.geometry = previousUndoState.link.geometry;
        });
    }

    @action
    public redo = () => {
        this._undoStore.redo((nextUndoState: UndoState) => {
            this._link!.geometry = nextUndoState.link.geometry;
        });
    }
}

const observableLinkStore = new LinkStore();

export default observableLinkStore;
