import { action, computed, observable } from 'mobx';

export class SidebarStore {
    @observable private _openedNodeId: number|null;
    @observable private _isLoading: boolean;

    constructor() {
        this._openedNodeId = null;
        this._isLoading = true;
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
    public openNodeView(id: number) {
        this._openedNodeId = id;
    }

    @computed get isLoading(): boolean {
        return this._isLoading;
    }

    set isLoading(value: boolean) {
        this._isLoading = value;
    }

    @action
    public closeNodeView() {
        this._openedNodeId = null;
    }
}

const observableSidebarStore = new SidebarStore();

export default observableSidebarStore;
