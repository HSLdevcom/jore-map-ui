import { action, computed, observable } from 'mobx';

export class SidebarStore {
    @observable private _openNodeId: number|null;
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
    }

    @action
    public setOpenLinkId(id: number|null) {
        this._openLinkId = id;
    }

}

const observableSidebarStore = new SidebarStore();

export default observableSidebarStore;
