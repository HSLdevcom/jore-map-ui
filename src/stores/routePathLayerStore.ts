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

    constructor() {
        this._neighborLinks = [];
    }

    @computed
    get neighborLinks(): INeighborLink[] {
        return this._neighborLinks;
    }

    @computed
    get neighborToAddType(): NeighborToAddType {
        return this._neighborToAddType;
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
    public clear = () => {
        this._neighborLinks = [];
    };
}

export default new RoutePathLayerStore();

export { RoutePathLayerStore, NeighborToAddType };
