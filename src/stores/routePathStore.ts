import { action, computed, observable } from 'mobx';
import { IRoutePath, INode } from '~/models';
import IRoutePathLink from '~/models/IRoutePathLink';

export enum AddRoutePathLinkState {
    SetTargetLocation,
    AddLinks,
}

export enum AddLinkDirection {
    BeforeNode,
    AfterNode,
}

export class RoutePathStore {
    @observable private _isCreating: boolean;
    @observable private _routePath: IRoutePath|null;
    @observable private _hasUnsavedModifications: boolean;
    @observable private _neighborRoutePathLinks: IRoutePathLink[];
    @observable private _highlightedNodes: string[];
    @observable private _highlightedLinks: string[];
    @observable private _addRoutePathLinkState: AddRoutePathLinkState;
    @observable private _addRoutePathLinkDirection: AddLinkDirection;

    constructor() {
        this._neighborRoutePathLinks = [];
        this._hasUnsavedModifications = false;
        this._highlightedLinks = [];
        this._highlightedNodes = [];
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

    isNodeHighlighted(nodeId: string) {
        return this._highlightedNodes.some(n => n === nodeId);
    }

    isLinkHighlighted(linkId: string) {
        return this._highlightedLinks.some(l => l === linkId);
    }

    @action
    setHighlightedNodes(nodeIds: string[]) {
        this._highlightedNodes = nodeIds;
    }

    @action
    setHighlightedLinks(linkIds: string[]) {
        this._highlightedLinks = linkIds;
    }

    @action
    setIsCreating(value: boolean) {
        this._isCreating = value;
    }

    @action
    setAddRoutePathLinkDirection(direction: AddLinkDirection) {
        this._addRoutePathLinkDirection = direction;
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
        this._addRoutePathLinkState = routePathLinks.length === 0
            ? AddRoutePathLinkState.SetTargetLocation : AddRoutePathLinkState.AddLinks;
    }

    @action
    addLink(routePathLink: IRoutePathLink) {
        this._routePath!.routePathLinks!.splice(
            routePathLink.orderNumber,
            0,
            routePathLink);
        this.recalculateOrderNumbers();
        this._hasUnsavedModifications = true;
    }

    private recalculateOrderNumbers = () => {
        this._routePath!.routePathLinks!.forEach((rpLink, index) => {
            rpLink.orderNumber = index;
        });
    }

    public isRoutePathNodeMissingNeighbour = (node: INode) => {
        // A node needs to have an even amount of neighbours
        let neighbourCount = 0;
        this._routePath!.routePathLinks!.forEach((rpLink, index) => {
            if (rpLink.endNode.id === node.id) {
                // If last node
                if (
                    this._routePath!.routePathLinks!.length === index + 1
                    || this._routePath!.routePathLinks![index + 1].startNode.id !== node.id) {
                    neighbourCount += 1;
                }
            } else if (rpLink.startNode.id === node.id) {
                // If first node
                if (index === 0
                    || this._routePath!.routePathLinks![index - 1].endNode.id !== node.id) {
                    neighbourCount += 1;
                }
            }
        });
        return neighbourCount % 2 !== 0;
    }

    @action
    removeLink(id: string) {
        this._routePath!.routePathLinks =
            this._routePath!.routePathLinks!.filter(link => link.id !== id);
        this.recalculateOrderNumbers();
        this._hasUnsavedModifications = true;
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

    getLinkGeom(linkId: string) {
        const link = this._routePath!.routePathLinks!.find(l => l.id === linkId);
        if (link) {
            return link.positions;
        }
        return null;
    }

    getNodeGeom(nodeId: string) {
        let node = this._routePath!.routePathLinks!.find(l => l.startNode.id === nodeId);
        if (!node) {
            node = this._routePath!.routePathLinks!.find(l => l.endNode.id === nodeId);
        }
        if (node) {
            return node.positions;
        }
        return null;
    }
}

const observableStoreStore = new RoutePathStore();

export default observableStoreStore;
