import { action, computed, observable } from 'mobx';
import ColorScale from '~/helpers/ColorScale';
import { ILine, IRoute, IRoutePath } from '~/models';
import RoutePathService from '~/services/routePathService';

export class RouteListStore {
    @observable private _routes: IRoute[];
    @observable private _lines: ILine[];
    private colorScale: ColorScale;

    constructor() {
        this._routes = [];
        this._lines = [];
        this.colorScale = new ColorScale();
    }

    @computed
    get routes(): IRoute[] {
        return this._routes;
    }

    public getLine(lineId: string): ILine | undefined {
        return this._lines.find(line => line.id === lineId);
    }

    @action
    public addToRoutes = (routes: IRoute[]) => {
        this._routes = this._routes.concat(routes);
    };

    @action
    public addToLines = (lines: ILine[]) => {
        this._lines = this._lines.concat(lines);
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
    public updateRoute = (route: IRoute) => {
        const routeToUpdateIndex = this._routes.findIndex((iterator: IRoute) => {
            return iterator.id === route.id;
        });
        this._routes[routeToUpdateIndex] = route;
    };

    @action
    public clearRoutes = () => {
        this._routes = [];
        this.colorScale = new ColorScale();
    };

    @action
    public setRoutePathVisibility = async (isVisible: boolean, internalId: string) => {
        const currentRoutePath = this.getRoutePath(internalId);
        if (!currentRoutePath) return;
        if (isVisible === currentRoutePath.visible) return;

        currentRoutePath.visible = isVisible;
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
    };

    @action
    public toggleRoutePathVisibility = async (internalId: string) => {
        const currentRoutePath = this.getRoutePath(internalId);
        if (!currentRoutePath) return;
        this.setRoutePathVisibility(!currentRoutePath.visible, internalId);
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
