import { action, computed, observable } from 'mobx';
import { IRoute, IRoutePath } from '../models';

export class RouteStore {

    @computed get routes(): IRoute[] {
        if (this._routes.length < 1) return [];
        return this._routes;
    }

    set routes(value: IRoute[]) {
        this._routes = value;
    }

    @computed get routePaths(): IRoutePath[] {
        if (this._routePaths.length < 1) return [];
        return this._routePaths;
    }

    get visibleRoutePathAmount(): number {
        let visibleRoutePathsTotal = 0;
        this._routes.forEach((route: IRoute) => {
            const visibleRoutePaths = route.routePaths.filter(
                x => x.visible).length;
            visibleRoutePathsTotal = visibleRoutePathsTotal + visibleRoutePaths;
        });

        return visibleRoutePathsTotal;
    }
    @observable private _routes: IRoute[];
    @observable private _routePaths: IRoutePath[];

    constructor() {
        this._routes = [];
        this._routePaths = [];
    }

    @action
    public addToRoutes(node: IRoute) {
        this._routes.push(node);
    }

    @action
    public addToRoutePaths(routePath: IRoutePath) {
        this._routePaths.push(routePath);
    }

    @action
    public clearRoutePaths() {
        this._routePaths = [];
    }

    @action
    public removeFromRoutes(routeId: string) {
        for (let i = 0; i < this._routes.length; i += 1) {
            if (this._routes[i].routeId === routeId) {
                this._routes.splice(i, 1);
            }
        }
    }

    @action
    public clearRoutes() {
        this._routes = [];
    }

    @action
    public toggleRoutePathVisibility(internalId: string) {
        const routePathObservable = this.getRoutePath(internalId);
        if (routePathObservable) {
            routePathObservable.visible = !routePathObservable.visible;
        }
    }

    private getRoutePath(internalId: string): IRoutePath | null {
        let routePathObservable: IRoutePath | null = null;
        this._routes.find((_route) => {
            const found = _route.routePaths.find(_routePath =>
                _routePath.internalId === internalId,
            );
            if (found) {
                routePathObservable = found;
                return true;
            }
            return false;
        });
        return routePathObservable;
    }
}

const observableStoreStore = new RouteStore();

export default observableStoreStore;
