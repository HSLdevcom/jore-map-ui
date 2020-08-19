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

    constructor() {
        this._neighborLinks = [];
        this._extendedListItemId = null;
        this._hoveredItemId = null;
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
    public setHoveredItemId = (id: string | null) => {
        this._hoveredItemId = id;
    };

    @action
    public clear = () => {
        this._neighborLinks = [];
        this._extendedListItemId = null;
        this._hoveredItemId = null;
    };
}

export default new RoutePathLayerStore();

export { RoutePathLayerStore, NeighborToAddType };
