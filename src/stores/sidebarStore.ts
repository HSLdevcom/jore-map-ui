import { action, computed, observable } from 'mobx';

export class SidebarStore {
    @observable private _openedNodeId: number|null;
    @observable private _openedLinkId: number|null;

    constructor() {
        this._openedNodeId = null;
        this._openedLinkId = null;
    }

    @computed
    get showNodeWindow(): boolean {
        return Boolean(this._openedNodeId);
    }

    @computed
    get showLinkWindow(): boolean {
        return Boolean(this._openedLinkId);
    }

    @computed
    get openedNodeId(): number|null {
        return this._openedNodeId;
    }

    @computed
    get getSideBarWidth(): number {
        if (Boolean(this._openedNodeId)) {
            return 450;
        }
        if (Boolean(this._openedLinkId)) {
            return 500;
        }
        return 400;
    }

    @action
    public openNodeView(id: number) {
        this.closeViews();
        this._openedNodeId = id;
    }

    @action
    public openLinkView(id: number) {
        this.closeViews();
        this._openedLinkId = id;
    }

    @action
    public closeNodeView() {
        this._openedNodeId = null;
    }

    @action
    public closeLinkView() {
        this._openedLinkId = null;
    }

    public closeViews() {
        this.closeNodeView();
        this.closeLinkView();
    }
}

const observableSidebarStore = new SidebarStore();

export default observableSidebarStore;
