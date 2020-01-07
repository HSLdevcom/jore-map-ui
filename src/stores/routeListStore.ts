import { action, computed, observable } from 'mobx';
import { IRoute, IRoutePath } from '~/models';
import RoutePathService from '~/services/routePathService';
import ColorScale from '~/util/ColorScale';

export class RouteListStore {
    @observable private _routes: IRoute[];
    private colorScale: ColorScale;

    constructor() {
        this._routes = [];
        this.colorScale = new ColorScale();
    }

    @computed
    get routes(): IRoute[] {
        return this._routes;
    }

    @action
    public addToRoutes = (routes: IRoute[]) => {
        this._routes.push(...routes);
    };

    @action
    public removeFromRoutes = (routeId: string) => {
        for (let i = 0; i < this._routes.length; i += 1) {
            if (this._routes[i].id === routeId) {
                this._routes[i].routePaths.forEach(routePath =>
                    this.colorScale.releaseColor(routePath.color!)
                );
                this._routes.splice(i, 1);
            }
        }
    };

    @action
    public clearRoutes = () => {
        this._routes = [];
        this.colorScale = new ColorScale();
    };

    @action
    public toggleRoutePathVisibility = async (internalId: string) => {
        const currentRoutePath = this.getRoutePath(internalId);
        if (currentRoutePath) {
            currentRoutePath.visible = !currentRoutePath.visible;
            currentRoutePath.color = currentRoutePath.visible
                ? this.colorScale.reserveColor()
                : this.colorScale.releaseColor(currentRoutePath.color!);
            if (currentRoutePath.visible && currentRoutePath.routePathLinks.length === 0) {
                const newRoutePath = await RoutePathService.fetchRoutePath(
                    currentRoutePath.routeId,
                    currentRoutePath.startTime,
                    currentRoutePath.direction
                );
                this.updateRoutePathLinks(newRoutePath, internalId);
            }
        }
    };

    @action
    private updateRoutePathLinks = (newRoutePath: IRoutePath, internalId: string) => {
        const oldRoutePath = this.getRoutePath(internalId);
        if (oldRoutePath) {
            oldRoutePath.routePathLinks = newRoutePath.routePathLinks;
        }
    };

    private getRoutePath = (internalId: string): IRoutePath | null => {
        let foundRoutePath: IRoutePath | null = null;
        this._routes.find(_route => {
            const found = _route.routePaths.find(
                _routePath => _routePath.internalId === internalId
            );
            if (found) {
                foundRoutePath = found;
                return true;
            }
            return false;
        });
        return foundRoutePath;
    };
}

const observableStoreStore = new RouteListStore();

export default observableStoreStore;
