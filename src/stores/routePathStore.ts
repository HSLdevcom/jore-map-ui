import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { IRoutePath, IRoutePathLink } from '~/models';
import lengthCalculator from '~/util/lengthCalculator';
import { validateRoutePathLinks } from '~/util/geomValidator';
import UndoStore from '~/stores/undoStore';

// Is the neighbor to add either startNode or endNode
export enum NeighborToAddType {
    AfterNode,
    BeforeNode,
}

export enum RoutePathViewTab {
    Info,
    List,
}

export interface UndoState {
    routePathLinks: IRoutePathLink[];
}

export class RoutePathStore {
    @observable private _routePath: IRoutePath|null;
    @observable private _oldRoutePath: IRoutePath|null;
    @observable private _isGeometryValid: boolean;
    @observable private _neighborRoutePathLinks: IRoutePathLink[];
    @observable private _neighborToAddType: NeighborToAddType;
    @observable private _highlightedMapItem: string | null;
    @observable private _extendedListItems: string[];
    // TODO: Move out of store:
    @observable private _activeTab: RoutePathViewTab;
    private _undoStore: UndoStore<UndoState>;

    constructor() {
        this._neighborRoutePathLinks = [];
        this._highlightedMapItem = null;
        this._extendedListItems = [];
        this._isGeometryValid = true;
        this._activeTab = RoutePathViewTab.Info;
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
    get neighborToAddType(): NeighborToAddType {
        return this._neighborToAddType;
    }

    @computed
    get isGeometryValid() {
        return this._isGeometryValid;
    }

    @computed
    get isDirty() {
        return !_.isEqual(this._routePath, this._oldRoutePath);
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

    public isMapItemHighlighted = (objectId: string) => {
        return this._highlightedMapItem === objectId
            || (!this._highlightedMapItem && this.isListItemExtended(objectId));
    }

    public isListItemExtended = (objectId: string) => {
        return this._extendedListItems.some(n => n === objectId);
    }

    @computed
    get extendedObjects() {
        return this._extendedListItems;
    }

    @action
    public undo() {
        this._undoStore.undo((nextUndoState: UndoState) => {
            this._neighborRoutePathLinks = [];
            this._routePath!.routePathLinks = nextUndoState.routePathLinks;
        });
    }

    @action
    public redo() {
        this._undoStore.redo((previousUndoState: UndoState) => {
            this._neighborRoutePathLinks = [];
            this._routePath!.routePathLinks = previousUndoState.routePathLinks;
        });
    }

    @action
    public onRoutePathLinksChanged() {
        this.recalculateOrderNumbers();
        this.validateRoutePathGeometry();
    }

    @action
    public resetUndoState() {
        this._neighborRoutePathLinks = [];

        const routePathLinks = this._routePath && this._routePath.routePathLinks ?
            this._routePath.routePathLinks : [];
        const currentUndoState: UndoState = {
            routePathLinks: _.cloneDeep(routePathLinks),
        };
        this._undoStore.addItem(currentUndoState);
    }

    @action
    public setHighlightedObject = (objectId: string | null) => {
        this._highlightedMapItem = objectId;
    }

    @action
    public toggleExtendedListItem = (objectId: string) => {
        if (this._extendedListItems.some(o => o === objectId)) {
            this._extendedListItems = this._extendedListItems.filter(o => o !== objectId);
        } else {
            this._extendedListItems.push(objectId);
        }
    }

    @action
    public setExtendedObjects = (objectIds: string[]) => {
        this._extendedListItems = objectIds;
    }

    @action
    public setRoutePath = (routePath: IRoutePath) => {
        this._routePath = routePath;
        // Need to recalculate orderNumbers to ensure that they are correct
        this.recalculateOrderNumbers();
        const routePathLinks = routePath.routePathLinks ? routePath.routePathLinks : [];
        const currentUndoState: UndoState = {
            routePathLinks,
        };
        this._undoStore.addItem(currentUndoState);
        this._isGeometryValid = validateRoutePathLinks(routePathLinks);

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
    }

    @action
    public setNeighborToAddType = (neighborToAddType: NeighborToAddType) => {
        this._neighborToAddType = neighborToAddType;
    }

    @action
    public addLink = (routePathLink: IRoutePathLink) => {
        this._routePath!.routePathLinks!.splice(
            // Order numbers start from 1
            routePathLink.orderNumber - 1,
            0,
            routePathLink);

        this.recalculateOrderNumbers();

        this.resetUndoState();
    }

    @action
    public removeLink = (id: string) => {
        // Need to do splice to trigger ReactionDisposer watcher
        const linkToRemoveIndex =
            this._routePath!.routePathLinks!.findIndex(link => link.id === id);
        this._routePath!.routePathLinks!.splice(linkToRemoveIndex, 1);

        this.recalculateOrderNumbers();

        this.resetUndoState();
    }

    @action
    public setRoutePathLinks = (routePathLinks: IRoutePathLink[]) => {
        this._routePath!.routePathLinks = routePathLinks;
        this.recalculateOrderNumbers();

        this.sortRoutePathLinks();
    }

    @action
    public sortRoutePathLinks = () => {
        this._routePath!.routePathLinks =
            this._routePath!.routePathLinks!.slice().sort((a, b) => a.orderNumber - b.orderNumber);
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

    public getLinkGeom = (linkId: string): L.LatLng[] => {
        const link = this._routePath!.routePathLinks!.find(l => l.id === linkId);
        if (link) {
            return link.geometry;
        }
        return [];
    }

    public getNodeGeom = (nodeId: string): L.LatLng[] => {
        let node = this._routePath!.routePathLinks!.find(l => l.startNode.id === nodeId);
        if (!node) {
            node = this._routePath!.routePathLinks!.find(l => l.endNode.id === nodeId);
        }
        if (node) {
            return node.geometry;
        }
        return [];
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
