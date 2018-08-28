import { action, computed, observable } from 'mobx';
import { IRoute, IRoutePath } from '../models';

export class RouteStore {

    @observable private _routes: IRoute[];
    @observable private _routeLoading: boolean;

    constructor() {
        this._routes = [];
        this._routeLoading = false;
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
    public addToRoutes(node: IRoute) {
        this._routes.push(node);
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
