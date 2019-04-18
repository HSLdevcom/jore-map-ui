import { action, computed, observable } from 'mobx';
import * as L from 'leaflet';
import { INode } from '~/models';
import { IRoutePathPrimaryKey } from '~/models/IRoutePath';
import TransitType from '~/enums/transitType';

interface CopySeqmentNode {
    nodeId: string;
    geometry: L.LatLng;
}

interface CopySeqmentLink {
    geometry: L.LatLng[];
    startNodeId: string;
    endNodeId: string;
    orderNumber: number;
}

interface CopySeqmentRoutePath extends IRoutePathPrimaryKey {
    transitType: TransitType;
    links: CopySeqmentLink[];
}

class RoutePathCopySeqmentStore {
    @observable private _startNode: CopySeqmentNode|null;
    @observable private _endNode: CopySeqmentNode|null;
    @observable private _routePaths: CopySeqmentRoutePath[];

    constructor() {
        this._startNode = null;
        this._endNode = null;
    }

    @computed
    get startNode(): CopySeqmentNode|null {
        return this._startNode;
    }

    @computed
    get endNode(): CopySeqmentNode|null {
        return this._endNode;
    }

    @computed
    get routePaths(): CopySeqmentRoutePath[] {
        return this._routePaths;
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
    public setRoutePaths = (routePaths: CopySeqmentRoutePath[]) => {
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
    CopySeqmentNode,
    CopySeqmentLink,
    CopySeqmentRoutePath,
};
