import { action, computed, observable } from 'mobx';
import { IRoute } from '../models';

export class RouteStore {
    @observable private _openRoutes: IRoute[];

    constructor() {
        this._openRoutes = [];
    }

    @computed get openRoutes(): IRoute[] {
        return this._openRoutes;
    }

    @action
    public addToOpenedRoutes(node: IRoute) {
        this._openRoutes.push(node);
    }

    @action
    public clearOpenRoutes() {
        this._openRoutes = [];
    }
}

const observableStoreStore = new RouteStore();

export default observableStoreStore;
