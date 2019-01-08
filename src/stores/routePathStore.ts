import { action, computed, observable } from 'mobx';
import { IRoutePath } from '~/models';
import IRoutePathLink from '~/models/IRoutePathLink';

export class RoutePathStore {
    @observable private _isCreating: boolean;
    @observable private _routePath: IRoutePath|null;

    @observable private _neighborRoutePathLinks: IRoutePathLink[];

    constructor() {
        this._neighborRoutePathLinks = [];
    }

    @computed
    get isCreating(): boolean {
        return this._isCreating;
    }

    @computed
    get routePath(): IRoutePath|null {
        return this._routePath;
    }

    @computed
    get neighborLinks(): IRoutePathLink[] {
        return this._neighborRoutePathLinks;
    }

    @action
    setIsCreating(value: boolean) {
        this._isCreating = value;
    }

    @action
    setRoutePath(routePath: IRoutePath|null) {
        this._routePath = routePath;
        if (!routePath) {
            this._neighborRoutePathLinks = [];
        }
    }

    @action
    updateRoutePathProperty(property: string, value: string) {
        this._routePath = {
            ...this._routePath!,
            [property]: value,
        };
    }

    @action
    setNeighborRoutePathLinks(routePathLinks: IRoutePathLink[]) {
        this._neighborRoutePathLinks = routePathLinks;
    }

    @action
    addLink(routePathLink: IRoutePathLink) {
        this._routePath!.routePathLinks!.push(routePathLink);
    }

    @action
    setRoutePathLinks(routePathLinks: IRoutePathLink[]) {
        this._routePath!.routePathLinks = routePathLinks;
    }

    @action
    clear() {
        this._routePath = null;
        this._neighborRoutePathLinks = [];
    }

}

const observableStoreStore = new RoutePathStore();

export default observableStoreStore;
