import { action, computed, observable } from 'mobx';

export class SidebarStore {
    @observable private _openedNodeId: number|null;

    constructor() {
        this._openedNodeId = null;
    }

    @computed
    get showNodeWindow(): boolean {
        return Boolean(this._openedNodeId);
    }

    @computed
    get openedNodeId(): number|null {
        return this._openedNodeId;
    }

    @action
    public setOpenedNodeId(id: number|null) {
        this._openedNodeId = id;
    }
}

const observableSidebarStore = new SidebarStore();

export default observableSidebarStore;
