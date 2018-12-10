import { action, computed, observable } from 'mobx';

export class EditNetworkStore {
    @observable private _isWaitingForNodeSelection: Boolean;

    constructor() {
        this._isWaitingForNodeSelection = false;
    }

    @computed
    get isWaitingForNodeSelection() {
        return this._isWaitingForNodeSelection;
    }

    @action
    public setIsWaitingForNodeSelection(value: boolean) {
        this._isWaitingForNodeSelection = value;
    }
}

const observableNetworkStore = new EditNetworkStore();

export default observableNetworkStore;
