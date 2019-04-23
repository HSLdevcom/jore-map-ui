import { action, computed, observable } from 'mobx';
import * as L from 'leaflet';
import { INode } from '~/models';
import { IRoutePathPrimaryKey } from '~/models/IRoutePath';
import TransitType from '~/enums/transitType';

interface ICopySeqmentNode {
    nodeId: string;
    geometry: L.LatLng;
}

interface ICopySeqmentLink {
    geometry: L.LatLng[];
    startNodeId: string;
    endNodeId: string;
    orderNumber: number;
}

interface ICopySeqmentRoutePath extends IRoutePathPrimaryKey {
    transitType: TransitType;
    links: ICopySeqmentLink[];
}

class RoutePathCopySeqmentStore {
    @observable private _isLoading: boolean;
    @observable private _startNode: ICopySeqmentNode|null;
    @observable private _endNode: ICopySeqmentNode|null;
    @observable private _routePaths: ICopySeqmentRoutePath[];

    constructor() {
        this._isLoading = true;
        this._startNode = null;
        this._endNode = null;
        this._routePaths = [];
    }

    @computed
    get isLoading(): boolean {
        return this._isLoading;
    }

    @computed
    get startNode(): ICopySeqmentNode|null {
        return this._startNode;
    }

    @computed
    get endNode(): ICopySeqmentNode|null {
        return this._endNode;
    }

    @computed
    get routePaths(): ICopySeqmentRoutePath[] {
        return this._routePaths;
    }

    @action
    public setIsLoading = (isLoading: boolean) => {
        this._isLoading = isLoading;
    }

    @action
    public setStartNode = (node: INode) => {
        this._startNode = {
            nodeId: node.id,
            geometry: node.coordinates,
        };
    }

    @action
    public setEndNode = (node: INode) => {
        this._endNode = {
            nodeId: node.id,
            geometry: node.coordinates,
        };
    }

    @action
    public setRoutePaths = (routePaths: ICopySeqmentRoutePath[]) => {
        this._routePaths = routePaths;
    }

    @action
    public clear = () => {
        this._endNode = null;
        this._startNode = null;
        this._routePaths = [];
    }
}

export default new RoutePathCopySeqmentStore();

export {
    RoutePathCopySeqmentStore,
    ICopySeqmentNode,
    ICopySeqmentLink,
    ICopySeqmentRoutePath,
};
