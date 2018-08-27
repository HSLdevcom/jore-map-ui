import { action, computed, observable } from 'mobx';
import { IRoute, IRoutePath } from '../models';

export class RouteStore {

    @observable private _routes: IRoute[];
    @observable private _routeLoading: boolean;

    constructor() {
        this._routes = [];
        this._routeLoading = true;
    }

    @computed get routes(): IRoute[] {
        if (this._routes.length < 1) return [];
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

    private findObservableRoutePath(route: IRoute, routePath: IRoutePath): IRoutePath | null {
        let routePathObservable: IRoutePath | null = null;

        this._routes.find((_route) => {
            const found = _route.routePaths.find(_routePath =>
                _routePath.direction === routePath.direction &&
                _routePath.endTime.getTime() === routePath.endTime.getTime() &&
                _routePath.startTime.getTime() === routePath.startTime.getTime() &&
                _route.lineId === route.lineId,
            );
            if (found) {
                routePathObservable = found;
                return true;
            }
            return false;
        });
        return routePathObservable;
    }

    @action
    public toggleRoutePathVisibility(route: IRoute, routePath: IRoutePath) {
        const routePathObservable = this.findObservableRoutePath(route, routePath);
        if (routePathObservable) {
            routePathObservable.visible = !routePathObservable.visible;
        }
    }

    @computed get routeLoading(): boolean {
        return this._routeLoading;
    }

    set routeLoading(value: boolean) {
        this._routeLoading = value;
    }
}

const observableStoreStore = new RouteStore();

export default observableStoreStore;
