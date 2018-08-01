import { action, computed, observable } from 'mobx';
import { IRoute, IDirection } from '../models';

export class RouteStore {
    @observable private _routes: IRoute[];

    constructor() {
        this._routes = [];
    }

    @computed get routes(): IRoute[] {
        return this._routes;
    }

    @action
    public addToRoutes(node: IRoute) {
        this._routes.push(node);
    }

    @action
    public clearRoutes() {
        this._routes = [];
    }

    @action
    public toggleDirectionIsVisible(direction: IDirection) {
        direction.visible = !direction.visible;
    }
}

const observableStoreStore = new RouteStore();

export default observableStoreStore;
