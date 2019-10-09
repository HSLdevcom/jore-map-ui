import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { ILink, INode } from '~/models';
import { LatLng } from 'leaflet';
import GeometryUndoStore from '~/stores/geometryUndoStore';
import LeafletUtils from '~/util/leafletUtils';
import { roundLatLngs } from '~/util/geomHelper';

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
    private _geometryUndoStore: GeometryUndoStore<UndoState>;

    constructor() {
        this._nodes = [];
        this._link = null;
        this._oldLink = null;
        this._startMarkerCoordinates = null;
        this._isLinkGeometryEditable = true;
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

    @action
    public init = (link: ILink, nodes: INode[]) => {
        this.setLink(link);
        this.setNodes(nodes);
    };

    @action
    public setLink = (link: ILink) => {
        this._link = link;
        const currentUndoState: UndoState = {
            link
        };
        this._geometryUndoStore.addItem(currentUndoState);

        this.setOldLink(link);
    };

    @action
    public updateLinkGeometry = (latLngs: L.LatLng[]) => {
        if (!this._link || !this._isLinkGeometryEditable) return;

        const updatedLink = _.cloneDeep(this._link);
        updatedLink.geometry = roundLatLngs(latLngs);
        this._link.geometry = roundLatLngs(latLngs);
        this._link.length = this.getCalculatedLength();

        const currentUndoState: UndoState = {
            link: updatedLink
        };
        this._geometryUndoStore.addItem(currentUndoState);
    };

    @action
    public setNodes = (nodes: INode[]) => {
        this._nodes = nodes;
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
    public clear = () => {
        this._link = null;
        this._nodes = [];
        this._oldLink = null;
        this._startMarkerCoordinates = null;
        this._geometryUndoStore.clear();
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
                    geometry: this.link!.geometry.map(
                        coor => new LatLng(coor.lat, coor.lng)
                    )
                },
                this._oldLink
            )
        );
    }

    @action
    public resetChanges = () => {
        if (this._oldLink) {
            this.setLink(this._oldLink);
        }
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
            return LeafletUtils.calculateLength.fromLatLngs(this.link.geometry);
        }
        return 0;
    };
}

const observableLinkStore = new LinkStore();

export default observableLinkStore;
