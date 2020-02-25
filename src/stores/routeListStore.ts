import { action, computed, observable } from 'mobx';
import ColorScale from '~/helpers/ColorScale';
import { ILine, IRoute, IRoutePath } from '~/models';
import RoutePathService from '~/services/routePathService';

interface IRouteItem {
    route: IRoute;
    selectedTabIndex: number; // Needs to be in store instead of RouteItem's state to prevent state reseting when RouteItem re-renders
    areAllRoutePathsVisible: boolean; // Needs to be in store instead of RouteItem's state to prevent state reseting when RouteItem re-renders
}

export class RouteListStore {
    @observable private _routeItems: IRouteItem[];
    @observable private _lines: ILine[];
    private colorScale: ColorScale;

    constructor() {
        this._routeItems = [];
        this._lines = [];
        this.colorScale = new ColorScale();
    }

    @computed
    get routeItems(): IRouteItem[] {
        return this._routeItems;
    }

    @computed
    get routes(): IRoute[] {
        return this._routeItems.map(
            (routeItem: IRouteItem): IRoute => {
                return routeItem.route;
            }
        );
    }

    public getLine(lineId: string): ILine | undefined {
        return this._lines.find(line => line.id === lineId);
    }

    @action
    public addToRouteItems = (routes: IRoute[]) => {
        const routeItems = routes.map(
            (route: IRoute): IRouteItem => {
                return {
                    route,
                    selectedTabIndex: 0,
                    areAllRoutePathsVisible: false
                };
            }
        );
        this._routeItems = this._routeItems.concat(routeItems);
    };

    @action
    public addToLines = (lines: ILine[]) => {
        this._lines = this._lines.concat(lines);
    };

    @action
    public removeFromRouteItems = (routeId: string) => {
        for (let i = 0; i < this._routeItems.length; i += 1) {
            if (this._routeItems[i].route.id === routeId) {
                this._routeItems[i].route.routePaths.forEach(routePath =>
                    this.colorScale.releaseColor(routePath.color!)
                );
                this._routeItems.splice(i, 1);
            }
        }
    };

    @action
    public updateRoute = (route: IRoute) => {
        const routeToUpdateIndex = this._routeItems.findIndex((iterator: IRouteItem) => {
            return iterator.route.id === route.id;
        });
        this._routeItems[routeToUpdateIndex].route = route;
    };

    @action
    public clearRouteItems = () => {
        this._routeItems = [];
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
            this.updateRoutePathLinks(newRoutePath!, internalId);
        }
    };

    @action
    public toggleRoutePathVisibility = async (internalId: string) => {
        const currentRoutePath = this.getRoutePath(internalId);
        if (!currentRoutePath) return;
        this.setRoutePathVisibility(!currentRoutePath.visible, internalId);
    };

    @action
    public setSelectedTabIndex = (routeId: string, index: number) => {
        const routeItem = this._routeItems.find(routeItem => routeItem.route.id === routeId);
        routeItem!.selectedTabIndex = index;
    };

    @action
    public toggleAllRoutePathsVisible = (routeId: string) => {
        const routeItem = this._routeItems.find(routeItem => routeItem.route.id === routeId);
        routeItem!.areAllRoutePathsVisible = !routeItem!.areAllRoutePathsVisible;
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
        this._routeItems.find(routeItem => {
            const found = routeItem.route.routePaths.find(
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

export default new RouteListStore();

export { IRouteItem };
