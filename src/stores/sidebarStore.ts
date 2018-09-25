import { action, computed, observable } from 'mobx';

export class SidebarStore {
    // TODO: remove this from store. We get this at component from react-router's match param.
    @observable private _openNodeId: number|null;
    // TODO: remove this from store. We get this at component from react-router's match param.
    @observable private _openLinkId: number|null;

    constructor() {
        this._openNodeId = null;
        this._openLinkId = null;
    }

    @computed
    get openNodeId(): number|null {
        return this._openNodeId;
    }

    @computed
    get openLinkId(): number|null {
        return this._openLinkId;
    }

    @action
    public setOpenNodeId(id: number|null) {
        this._openNodeId = id;
        this._openLinkId = null;
    }

    @action
    public setOpenLinkId(id: number|null) {
        this._openLinkId = id;
        this._openNodeId = null;
    }

}

const observableSidebarStore = new SidebarStore();

export default observableSidebarStore;
