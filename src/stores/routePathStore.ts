import { action, computed, observable } from 'mobx';
import { IRoutePath } from '~/models';
import IRoutePathLink from '~/models/IRoutePathLink';
import lengthCalculator from '~/util/lengthCalculator';

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
    updateRoutePathProperty(property: string, value: string|number|Date) {
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
        this.recalculateLength();
        this._hasUnsavedModifications = true;
    }

    private recalculateOrderNumbers = () => {
        this._routePath!.routePathLinks!.forEach((rpLink, index) => {
            rpLink.orderNumber = index;
        });
    }

    @action
    removeLink(id: string) {
        this._routePath!.routePathLinks =
            this._routePath!.routePathLinks!.filter(link => link.id !== id);
        this.recalculateLength();
    }

    @action
    setRoutePathLinks(routePathLinks: IRoutePathLink[]) {
        this._routePath!.routePathLinks =
            routePathLinks.sort((a, b) => a.orderNumber - b.orderNumber);
        this.recalculateLength();
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

    @action
    recalculateLength() {
        this.updateRoutePathProperty(
            'length',
            Math.floor(
                lengthCalculator.fromRoutePathLinks(
                    this._routePath!.routePathLinks!,
                )),
            );
    }
}

const observableStoreStore = new RoutePathStore();

export default observableStoreStore;
