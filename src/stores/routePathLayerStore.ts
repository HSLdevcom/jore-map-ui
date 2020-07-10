import { INeighborLink } from '~/models';

import { action, computed, observable } from 'mobx';

// Is the neighbor to add either startNode or endNode
enum NeighborToAddType {
    AfterNode,
    BeforeNode,
}

class RoutePathLayerStore {
    @observable private _neighborLinks: INeighborLink[];
    @observable private _neighborToAddType: NeighborToAddType;
    @observable private _extendedListItemId: string | null;
    @observable private _highlightedListItemId: string | null;
    @observable private _toolHighlightedNodeIds: string[]; // node's highlighted (to indicate that they can be clicked)

    constructor() {
        this._neighborLinks = [];
        this._extendedListItemId = null;
        this._highlightedListItemId = null;
        this._toolHighlightedNodeIds = [];
    }

    @computed
    get neighborLinks(): INeighborLink[] {
        return this._neighborLinks;
    }

    @computed
    get neighborToAddType(): NeighborToAddType {
        return this._neighborToAddType;
    }

    @computed
    get extendedListItemId() {
        return this._extendedListItemId;
    }

    @computed
    get highlightedListItemId() {
        return this._highlightedListItemId;
    }

    @computed
    get toolHighlightedNodeIds() {
        return this._toolHighlightedNodeIds;
    }

    @action
    public setNeighborLinks = (neighborLinks: INeighborLink[]) => {
        this._neighborLinks = neighborLinks;
    };

    @action
    public setNeighborToAddType = (neighborToAddType: NeighborToAddType) => {
        this._neighborToAddType = neighborToAddType;
    };

    @action
    public setExtendedListItemId = (id: string | null) => {
        this._extendedListItemId = id;
    };

    @action
    public setHighlightedListItemId = (id: string | null) => {
        this._highlightedListItemId = id;
    };

    // TODO: nodeIds should be node.internalIds (overlapping nodes are different with different internalId but have the same nodeId)
    @action
    public setToolHighlightedNodeIds = (nodeIds: string[]) => {
        return (this._toolHighlightedNodeIds = nodeIds);
    };

    @action
    public clear = () => {
        this._neighborLinks = [];
        this._extendedListItemId = null;
        this._highlightedListItemId = null;
        this._toolHighlightedNodeIds = [];
    };
}

export default new RoutePathLayerStore();

export { RoutePathLayerStore, NeighborToAddType };
