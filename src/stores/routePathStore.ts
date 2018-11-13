import { action, computed, observable } from 'mobx';
import { IRoutePath } from '~/models';
import IRoutePathLink from '~/models/IRoutePathLink';

export class RoutePathStore {
    @observable private _isCreating: boolean;
    @observable private _routePath: IRoutePath;

    @observable private _neighborLinks: IRoutePathLink[];

    constructor() {
        this._neighborLinks = [];
    }

    @computed
    get isCreating(): boolean {
        return this._isCreating;
    }

    @computed
    get routePath(): IRoutePath {
        return this._routePath;
    }

    @computed
    get neighborLinks(): IRoutePathLink[] {
        return this._neighborLinks;
    }

    @action
    setIsCreating(value: boolean) {
        this._isCreating = value;
    }

    @action
    setRoutePath(routePath: IRoutePath) {
        this._routePath = routePath;
    }

    @action
    setNeighborLinks(links: IRoutePathLink[]) {
        this._neighborLinks = links;
    }

    @action
    addLink(link: IRoutePathLink) {
        this._routePath!.routePathLinks!.push(link);
    }

}

const observableStoreStore = new RoutePathStore();

export default observableStoreStore;
