import { action, computed, observable } from 'mobx';
import { IRoutePath, INode } from '~/models';
import IRoutePathLink from '~/models/IRoutePathLink';
import lengthCalculator from '~/util/lengthCalculator';
import { validateRoutePathLinks } from '~/util/geomValidator';

export enum AddRoutePathLinkState {
    SetTargetLocation,
    AddLinks,
}

export enum AddLinkDirection {
    BeforeNode,
    AfterNode,
}

export enum RoutePathViewTab {
    Info,
    List,
}

export class RoutePathStore {
    @observable private _isCreating: boolean;
    @observable private _routePath: IRoutePath|null;
    @observable private _hasUnsavedModifications: boolean;
    @observable private _isGeometryValid: boolean;
    @observable private _neighborRoutePathLinks: IRoutePathLink[];
    @observable private _highlightedObject: string | null;
    @observable private _extendedObjects: string[];
    @observable private _addRoutePathLinkState: AddRoutePathLinkState;
    @observable private _addRoutePathLinkDirection: AddLinkDirection;
    @observable private _activeTab: RoutePathViewTab;

    constructor() {
        this._neighborRoutePathLinks = [];
        this._hasUnsavedModifications = false;
        this._highlightedObject = null;
        this._extendedObjects = [];
        this._isGeometryValid = true;
        this._activeTab = RoutePathViewTab.Info;
        this._addRoutePathLinkState = AddRoutePathLinkState.SetTargetLocation;
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
    get addRoutePathLinkInfo(): { state: AddRoutePathLinkState, direction: AddLinkDirection} {
        return {
            state: this._addRoutePathLinkState,
            direction: this._addRoutePathLinkDirection,
        };
    }

    @computed
    get hasUnsavedModifications() {
        return this._hasUnsavedModifications;
    }

    @computed
    get isGeometryValid() {
        return this._isGeometryValid;
    }

    @computed
    get activeTab() {
        return this._activeTab;
    }

    @action
    public setActiveTab = (tab: RoutePathViewTab) => {
        this._activeTab = tab;
    }

    @action
    public toggleActiveTab = () => {
        if (this._activeTab === RoutePathViewTab.Info) {
            this._activeTab = RoutePathViewTab.List;
        } else {
            this._activeTab = RoutePathViewTab.Info;
        }
    }

    public isObjectHighlighted = (objectId: string) => {
        return this._highlightedObject === objectId
            || (!this._highlightedObject && this.isObjectExtended(objectId));
    }

    public isObjectExtended = (objectId: string) => {
        return this._extendedObjects.some(n => n === objectId);
    }

    @computed
    get extendedObjects() {
        return this._extendedObjects;
    }

    @action
    public setHighlightedObject = (objectId: string | null) => {
        this._highlightedObject = objectId;
    }

    @action
    public toggleExtendedObject = (objectId: string) => {
        if (this._extendedObjects.some(o => o === objectId)) {
            this._extendedObjects = this._extendedObjects.filter(o => o !== objectId);
        } else {
            this._extendedObjects.push(objectId);
        }
    }

    @action
    public setExtendedObjects = (objectIds: string[]) => {
        this._extendedObjects = objectIds;
    }

    @action
    public setIsCreating = (value: boolean) => {
        this._isCreating = value;
    }

    @action
    public setAddRoutePathLinkDirection = (direction: AddLinkDirection) => {
        this._addRoutePathLinkDirection = direction;
    }

    @action
    public setRoutePath = (routePath: IRoutePath|null) => {
        this._routePath = routePath;
        if (!routePath) {
            this._neighborRoutePathLinks = [];
        }
    }

    @action
    public updateRoutePathProperty = (property: string, value: string|number|Date) => {
        this._routePath = {
            ...this._routePath!,
            [property]: value,
        };
        this._hasUnsavedModifications = true;
    }

    @action
    public setNeighborRoutePathLinks = (routePathLinks: IRoutePathLink[]) => {
        this._neighborRoutePathLinks = routePathLinks;
        this._addRoutePathLinkState = routePathLinks.length === 0
            ? AddRoutePathLinkState.SetTargetLocation : AddRoutePathLinkState.AddLinks;
    }

    @action
    public addLink = (routePathLink: IRoutePathLink) => {
        this._routePath!.routePathLinks!.splice(
            // Order numbers start from 1
            routePathLink.orderNumber - 1,
            0,
            routePathLink);
        this.onRoutePathLinksChanged();
        this._hasUnsavedModifications = true;
    }

    public isRoutePathNodeMissingNeighbour = (node: INode) => (
        // A node needs to have an even amount of neighbours
            this._routePath!.routePathLinks!
                .filter(x => x.startNode.id === node.id).length
            !== this._routePath!.routePathLinks!
                .filter(x => x.endNode.id === node.id).length
    )

    @action
    public removeLink = (id: string) => {
        this._routePath!.routePathLinks =
            this._routePath!.routePathLinks!.filter(link => link.id !== id);
        this.onRoutePathLinksChanged();
        this._hasUnsavedModifications = true;
    }

    @action
    public setRoutePathLinks = (routePathLinks: IRoutePathLink[]) => {
        this._routePath!.routePathLinks =
            routePathLinks.sort((a, b) => a.orderNumber - b.orderNumber);
        this.recalculateLength();
    }

    @action
    public clear = () => {
        this._routePath = null;
        this._neighborRoutePathLinks = [];
    }

    @action
    public resetHaveLocalModifications = () => {
        this._hasUnsavedModifications = false;
    }

    @action
    public recalculateLength = () => {
        this.updateRoutePathProperty(
            'length',
            Math.floor(
                lengthCalculator.fromRoutePathLinks(
                    this._routePath!.routePathLinks!,
                )),
            );
    }

    public getLinkGeom = (linkId: string) => {
        const link = this._routePath!.routePathLinks!.find(l => l.id === linkId);
        if (link) {
            return link.positions;
        }
        return null;
    }

    public getNodeGeom = (nodeId: string) => {
        let node = this._routePath!.routePathLinks!.find(l => l.startNode.id === nodeId);
        if (!node) {
            node = this._routePath!.routePathLinks!.find(l => l.endNode.id === nodeId);
        }
        if (node) {
            return node.positions;
        }
        return null;
    }

    private recalculateOrderNumbers = () => {
        this._routePath!.routePathLinks!.forEach((rpLink, index) => {
            // Order numbers start from 1
            rpLink.orderNumber = index + 1;
        });
    }

    private validateRoutePathGeometry = () => {
        this._isGeometryValid = validateRoutePathLinks(
            this._routePath!.routePathLinks!,
        );
    }

    private onRoutePathLinksChanged = () => {
        this.recalculateOrderNumbers();
        this.recalculateLength();
        this.validateRoutePathGeometry();
    }
}

const observableStoreStore = new RoutePathStore();

export default observableStoreStore;
