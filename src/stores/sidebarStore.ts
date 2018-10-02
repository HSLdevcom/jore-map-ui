import { action, computed, observable } from 'mobx';

export class SidebarStore {
    // TODO: remove this from store. We get this at component from react-router's match param.
    @observable private _openLinkId: number|null;

    constructor() {
        this._openLinkId = null;
    }

    @computed
    get openLinkId(): number|null {
        return this._openLinkId;
    }

    @action
    public setOpenLinkId(id: number|null) {
        this._openLinkId = id;
    }

}

const observableSidebarStore = new SidebarStore();

export default observableSidebarStore;
