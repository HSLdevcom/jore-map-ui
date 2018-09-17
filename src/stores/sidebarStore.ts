import { action, computed, observable } from 'mobx';

export class SidebarStore {
    @observable private _openNodeId: number|null;
    @observable private _openLinkId: string|null;

    constructor() {
        this._openNodeId = null;
        this._openLinkId = null;
    }

    @computed
    get openNodeId(): number|null {
        return this._openNodeId;
    }

    @computed
    get openLinkId(): string|null {
        return this._openLinkId;
    }

    @action
    public setOpenNodeId(id: number|null) {
        this._openNodeId = id;
        if (this._openLinkId) this._openLinkId = null;
    }

    @action
    public setOpenLinkId(id: string|null) {
        this._openLinkId = id;
        if (this._openNodeId) this._openNodeId = null;
    }

}

const observableSidebarStore = new SidebarStore();

export default observableSidebarStore;
