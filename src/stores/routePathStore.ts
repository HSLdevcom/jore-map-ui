import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { IRoutePath, IRoutePathLink, INode } from '~/models';
import lengthCalculator from '~/util/lengthCalculator';
import { validateRoutePathLinks } from '~/util/geomValidator';
import UndoStore from '~/stores/undoStore';

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

export interface UndoObject {
    routePathLinks: IRoutePathLink[];
}

export class RoutePathStore {
    @observable private _routePath: IRoutePath|null;
    @observable private _oldRoutePath: IRoutePath|null;
    @observable private _isGeometryValid: boolean;
    @observable private _neighborRoutePathLinks: IRoutePathLink[];
    // TODO: Move out of store to state, rename as highlightedMapItems
    @observable private _highlightedObject: string | null;
    // TODO: Move out of store to state, rename as extendedListItems:
    @observable private _extendedObjects: string[];
    @observable private _addRoutePathLinkState: AddRoutePathLinkState;
    @observable private _addRoutePathLinkDirection: AddLinkDirection;
    // TODO: Move out of store:
    @observable private _activeTab: RoutePathViewTab;
    private _undoStore: UndoStore<UndoObject>;

    constructor() {
        this._neighborRoutePathLinks = [];
        this._highlightedObject = null;
        this._extendedObjects = [];
        this._isGeometryValid = true;
        this._activeTab = RoutePathViewTab.Info;
        this._addRoutePathLinkState = AddRoutePathLinkState.SetTargetLocation;
        this._undoStore = new UndoStore();
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
    get isGeometryValid() {
        return this._isGeometryValid;
    }

    @computed
    get isDirty() {
        return !_.isEqual(this.routePath, this._oldRoutePath);
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
    public undo() {
        this._undoStore.undo((undoObject: UndoObject) => {
            this._neighborRoutePathLinks = [];
            this._routePath!.routePathLinks = undoObject.routePathLinks;
        });
    }

    @action
    public redo() {
        this._undoStore.redo((undoObject: UndoObject) => {
            this._neighborRoutePathLinks = [];
            this._routePath!.routePathLinks = undoObject.routePathLinks;
        });
    }

    @action
    public onRoutePathLinksChanged() {
        this.recalculateOrderNumbers();
        this.validateRoutePathGeometry();
    }

    @action
    public resetUndoObjects() {
        this._neighborRoutePathLinks = [];

        const routePathLinks = this._routePath && this._routePath.routePathLinks ?
            this._routePath.routePathLinks : [];
        const undoObject: UndoObject = {
            routePathLinks: _.cloneDeep(routePathLinks),
        };
        this._undoStore.addUndoObject(undoObject);
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
    public setAddRoutePathLinkDirection = (direction: AddLinkDirection) => {
        this._addRoutePathLinkDirection = direction;
    }

    @action
    public setRoutePath = (routePath: IRoutePath) => {
        this._routePath = routePath;
        const routePathLinks = routePath.routePathLinks ? routePath.routePathLinks : [];
        const undoObject: UndoObject = {
            routePathLinks,
        };
        this._undoStore.addUndoObject(undoObject);

        this.setOldRoutePath(routePath);
    }

    @action
    public setOldRoutePath = (routePath: IRoutePath) => {
        this._oldRoutePath = routePath;
    }

    @action
    public updateRoutePathProperty = (property: string, value: string|number|Date) => {
        this._routePath = {
            ...this._routePath!,
            [property]: value,
        };
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

        this.resetUndoObjects();
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
        // Need to do splice to trigger ReactionDisposer watcher
        const linkToRemoveIndex =
            this._routePath!.routePathLinks!.findIndex(link => link.id === id);
        this._routePath!.routePathLinks!.splice(linkToRemoveIndex, 1);

        this.resetUndoObjects();
    }

    @action
    public setRoutePathLinks = (routePathLinks: IRoutePathLink[]) => {
        this._routePath!.routePathLinks =
            routePathLinks.sort((a, b) => a.orderNumber - b.orderNumber);
    }

    @action
    public undoChanges = () => {
        if (this._oldRoutePath) {
            this.setRoutePath(this._oldRoutePath);
        }
    }

    @action
    public clear = () => {
        this._routePath = null;
        this._neighborRoutePathLinks = [];
        this._undoStore.clear();
    }

    public getCalculatedLength = () => {
        if (this.routePath && this.routePath.routePathLinks) {
            return Math.floor(lengthCalculator.fromRoutePathLinks(this.routePath!.routePathLinks!));
        }
        return 0;
    }

    public getLinkGeom = (linkId: string) => {
        const link = this._routePath!.routePathLinks!.find(l => l.id === linkId);
        if (link) {
            return link.geometry;
        }
        return null;
    }

    public getNodeGeom = (nodeId: string) => {
        let node = this._routePath!.routePathLinks!.find(l => l.startNode.id === nodeId);
        if (!node) {
            node = this._routePath!.routePathLinks!.find(l => l.endNode.id === nodeId);
        }
        if (node) {
            return node.geometry;
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
}

const observableStoreStore = new RoutePathStore();

export default observableStoreStore;
