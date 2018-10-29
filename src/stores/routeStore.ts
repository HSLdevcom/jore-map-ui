import { action, computed, observable } from 'mobx';
import { IRoute, IRoutePath } from '~/models';

export class RouteStore {
    @observable private _routes: IRoute[];

    constructor() {
        this._routes = [];
    }

    @computed get routes(): IRoute[] {
        if (this._routes.length < 1) return [];
        return this._routes;
    }

    set routes(value: IRoute[]) {
        this._routes = value;
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

    @action
    public addToRoutes(routes: IRoute[]) {
        this._routes.push(...routes);
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

    @action
    public toggleRoutePathVisibility(internalId: string) {
        const routePathObservable = this.getRoutePath(internalId);
        if (routePathObservable) {
            routePathObservable.visible = !routePathObservable.visible;
        }
    }
}

const observableStoreStore = new RouteStore();

export default observableStoreStore;
