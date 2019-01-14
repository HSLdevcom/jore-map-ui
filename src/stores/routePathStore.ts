import { action, computed, observable } from 'mobx';
import { IRoutePath, INode } from '~/models';
import IRoutePathLink from '~/models/IRoutePathLink';

export class RoutePathStore {
    @observable private _isCreating: boolean;
    @observable private _routePath: IRoutePath|null;
    @observable private _hasUnsavedModifications: boolean;
    @observable private _neighborRoutePathLinks: IRoutePathLink[];
    @observable private _neighborRoutePathLinksAreGoingForward: boolean;

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

    @computed
    get areNeighborRoutePathLinksGoingForward() {
        return this._neighborRoutePathLinksAreGoingForward;
    }

    @action
    setNeighborRoutePathLinksAreGoingForward(value: boolean) {
        this._neighborRoutePathLinksAreGoingForward = value;
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
        const orderNumber = routePathLink.orderNumber;
        this._routePath!.routePathLinks!.splice(orderNumber, 0, routePathLink);
        this.recalculateOrderNumbers();
        this._hasUnsavedModifications = true;
    }

    private recalculateOrderNumbers = () => {
        this._routePath!.routePathLinks!.forEach((rpLink, index) => {
            rpLink.orderNumber = index;
        });
    }

    public isRoutePathNodeMissingNeighbour = (node: INode) => {
        let res = false;
        this._routePath!.routePathLinks!.forEach((rpLink, index) => {
            if (rpLink.endNode.id === node.id) {
                if (this._routePath!.routePathLinks!.length === index + 1) {
                    res = true;
                } else if (this._routePath!.routePathLinks![index + 1].startNode.id !== node.id) {
                    res = true;
                }
            } else if (rpLink.startNode.id === node.id) {
                if (index === 0) {
                    res = true;
                } else if (this._routePath!.routePathLinks![index - 1].endNode.id !== node.id) {
                    res = true;
                }
            }
        });
        return res;
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
