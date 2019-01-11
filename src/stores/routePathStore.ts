import { action, computed, observable } from 'mobx';
import { IRoutePath } from '~/models';
import IRoutePathLink from '~/models/IRoutePathLink';

export class RoutePathStore {
    @observable private _isCreating: boolean;
    @observable private _routePath: IRoutePath|null;
    @observable private _hasUnsavedModifications: boolean;
    @observable private _neighborRoutePathLinks: IRoutePathLink[];

    constructor() {
        this._neighborRoutePathLinks = [];
        this._hasUnsavedModifications = false;
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

    @computed
    get hasUnsavedModifications() {
        return this._hasUnsavedModifications;
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
        this._hasUnsavedModifications = true;
    }

    @action
    setNeighborRoutePathLinks(routePathLinks: IRoutePathLink[]) {
        this._neighborRoutePathLinks = routePathLinks;
    }

    @action
    addLink(routePathLink: IRoutePathLink) {
        this.setRoutePathLinks([...this._routePath!.routePathLinks, routePathLink]);
        this._hasUnsavedModifications = true;
    }

    @action
    removeLink(id: string) {
        this._routePath!.routePathLinks =
            this._routePath!.routePathLinks!.filter(link => link.id !== id);
    }

    @action
    setRoutePathLinks(routePathLinks: IRoutePathLink[]) {
        this._routePath!.routePathLinks =
            routePathLinks.sort((a, b) => a.orderNumber - b.orderNumber);
    }

    @action
    clear() {
        this._routePath = null;
        this._neighborRoutePathLinks = [];
    }

    @action
    resetHaveLocalModifications() {
        this._hasUnsavedModifications = false;
    }
}

const observableStoreStore = new RoutePathStore();

export default observableStoreStore;
