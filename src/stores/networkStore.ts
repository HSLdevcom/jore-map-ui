import { action, computed, observable } from 'mobx';
import TransitType from '../enums/transitType';

export class NetworkStore {
    @observable private _enabledTypes: TransitType[];
    @observable private _showLinks: boolean;
    @observable private _showNodes: boolean;

    constructor() {
        this._enabledTypes = [];
        this._showLinks = false;
        this._showNodes = false;
    }

    private isAnythingEnabled() {
        return this._showLinks || this._showNodes;
    }

    @computed get showLinks(): boolean {
        return this._showLinks;
    }

    @action
    public toggleShowLinks() {
        this._showLinks = !this._showLinks;
    }

    @computed get showNodes(): boolean {
        return this._showNodes;
    }

    @action
    public toggleShowNodes() {
        this._showNodes = !this._showNodes;
    }

    public isTypeEnabled(type: TransitType) {
        if (this.isAnythingEnabled()) {
            return this._enabledTypes.includes(type);
        }
        return false;
    }

    @computed get enabledTypes() {
        return this._enabledTypes;
    }

    @action
    public toggleTransitType(type: TransitType) {
        if (this.isTypeEnabled(type)) {
            this._enabledTypes = this._enabledTypes.filter(t => t !== type);
        } else {
            this._enabledTypes.push(type);
        }
    }
}

const observableNetworkStore = new NetworkStore();

export default observableNetworkStore;
