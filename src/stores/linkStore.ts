import { LatLng } from 'leaflet';
import _ from 'lodash';
import { action, computed, observable } from 'mobx';
import { ILink, INode } from '~/models';
import GeometryUndoStore from '~/stores/geometryUndoStore';
import { roundLatLngs } from '~/util/geomHelper';
import LeafletUtils from '~/util/leafletUtils';

export interface UndoState {
    link: ILink;
}

export class LinkStore {
    @observable private _link: ILink | null;
    @observable private _oldLink: ILink | null;
    @observable private _nodes: INode[];
    // variable for creating new link:
    @observable private _startMarkerCoordinates: LatLng | null;
    @observable private _isLinkGeometryEditable: boolean;
    @observable private _isEditingDisabled: boolean;
    private _geometryUndoStore: GeometryUndoStore<UndoState>;

    constructor() {
        this._nodes = [];
        this._link = null;
        this._oldLink = null;
        this._startMarkerCoordinates = null;
        this._isLinkGeometryEditable = true;
        this._isEditingDisabled = true;
        this._geometryUndoStore = new GeometryUndoStore();
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

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    @action
    public init = (link: ILink, nodes: INode[]) => {
        this.clear();
        this._link = link;
        this.setOldLink(link);
        this._nodes = nodes;
    };

    @action
    public updateLinkGeometry = (latLngs: L.LatLng[]) => {
        if (!this._link || !this._isLinkGeometryEditable) return;

        if (this._geometryUndoStore.getUndoObjectsLength() === 0) {
            // Add initial link to undoStore
            const currentLink = _.cloneDeep(this._link);
            const currentUndoState: UndoState = {
                link: currentLink
            };
            this._geometryUndoStore.addItem(currentUndoState);
        }

        const updatedLink = _.cloneDeep(this._link);
        updatedLink.geometry = roundLatLngs(latLngs);
        this._link.geometry = roundLatLngs(latLngs);
        this._link.length = this.getCalculatedLength();
        const newUndoState: UndoState = {
            link: updatedLink
        };
        this._geometryUndoStore.addItem(newUndoState);
    };

    @action
    public setOldLink = (link: ILink) => {
        this._oldLink = _.cloneDeep(link);
    };

    @action
    public setIsLinkGeometryEditable = (isEditable: boolean) => {
        this._isLinkGeometryEditable = isEditable;
    };

    @action
    public updateLinkProperty = (
        property: keyof ILink,
        value: string | number | Date | LatLng[]
    ) => {
        this._link![property] = value;
    };

    @action
    public setMarkerCoordinates = (startMarkerCoordinates: LatLng | null) => {
        this._startMarkerCoordinates = startMarkerCoordinates;
    };

    @action
    public setIsEditingDisabled = (isEditingDisabled: boolean) => {
        this._isEditingDisabled = isEditingDisabled;
    };

    @action
    public toggleIsEditingDisabled = () => {
        this._isEditingDisabled = !this._isEditingDisabled;
    };

    @action
    public clear = () => {
        this._link = null;
        this._nodes = [];
        this._oldLink = null;
        this._startMarkerCoordinates = null;
        this._geometryUndoStore.clear();
        this._isEditingDisabled = true;
    };

    @computed
    get isLinkGeometryEditable() {
        return this._isLinkGeometryEditable;
    }

    @computed
    get isDirty() {
        return (
            this._link &&
            !_.isEqual(
                {
                    ...this.link,
                    // Remapping geometry since edit initialization has added handlers
                    geometry: this.link!.geometry.map(coor => new LatLng(coor.lat, coor.lng))
                },
                this._oldLink
            )
        );
    }

    @action
    public resetChanges = () => {
        this.init(this._oldLink!, this._nodes);
    };

    @action
    public undo = () => {
        this._geometryUndoStore.undo((previousUndoState: UndoState) => {
            this._link!.geometry = previousUndoState.link.geometry;
        });
    };

    @action
    public redo = () => {
        this._geometryUndoStore.redo((nextUndoState: UndoState) => {
            this._link!.geometry = nextUndoState.link.geometry;
        });
    };

    public getCalculatedLength = (): number => {
        if (this.link && this.link.geometry) {
            return LeafletUtils.calculateLengthFromLatLngs(this.link.geometry);
        }
        return 0;
    };
}

const observableLinkStore = new LinkStore();

export default observableLinkStore;
