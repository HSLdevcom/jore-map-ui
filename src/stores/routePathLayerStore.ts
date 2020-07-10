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
    @observable private _hoveredItemId: string | null;
    @observable private _highlightedExtendToolNodeIds: string[];

    constructor() {
        this._neighborLinks = [];
        this._extendedListItemId = null;
        this._hoveredItemId = null;
        this._highlightedExtendToolNodeIds = [];
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
    get hoveredItemId() {
        return this._hoveredItemId;
    }

    @computed
    get highlightedExtendToolNodeIds() {
        return this._highlightedExtendToolNodeIds;
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
        this._hoveredItemId = id;
    };

    // TODO: nodeIds should be node.internalIds (overlapping nodes are different with different internalId but have the same nodeId)
    @action
    public setToolHighlightedNodeIds = (nodeIds: string[]) => {
        return (this._highlightedExtendToolNodeIds = nodeIds);
    };

    @action
    public clear = () => {
        this._neighborLinks = [];
        this._extendedListItemId = null;
        this._hoveredItemId = null;
        this._highlightedExtendToolNodeIds = [];
    };
}

export default new RoutePathLayerStore();

export { RoutePathLayerStore, NeighborToAddType };
