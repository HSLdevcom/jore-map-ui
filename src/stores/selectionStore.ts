import { action, computed, observable } from 'mobx';

export class SelectionStore {
    @observable private _selectedNodeId?: string;

    @computed get selectedNodeId() {
        return this._selectedNodeId;
    }

    @action
    public setSelectedNodeId(id: string) {
        this._selectedNodeId = id;
    }

    @action
    public clearSelectedNode() {
        this._selectedNodeId = undefined;
    }
}

const observableSelectionStore = new SelectionStore();

export default observableSelectionStore;
