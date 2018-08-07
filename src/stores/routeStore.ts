import { action, computed, observable, toJS } from 'mobx';
import { IRoute, IRoutePath } from '../models';

export class RouteStore {
    @observable private _routes = observable<IRoute>([]);

    @computed get routes(): IRoute[] {
        return toJS(this._routes);
    }

    @action
    public addToRoutes(node: IRoute) {
        this._routes.push(node);
    }

    @action
    public clearRoutes() {
        this._routes.clear();
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
}

const observableStoreStore = new RouteStore();

export default observableStoreStore;
