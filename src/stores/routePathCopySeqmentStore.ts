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
    routePathLinkId: number;
}

interface ICopySeqmentRoutePath extends IRoutePathPrimaryKey {
    transitType: TransitType;
    endTime: Date;
    originFi: string;
    destinationFi: string;
    links: ICopySeqmentLink[];
}

// which type of node will be set next when a node is selected on map
type setNodeType = 'startNode' | 'endNode';

class RoutePathCopySeqmentStore {
    @observable private _isLoading: boolean;
    @observable private _startNode: ICopySeqmentNode|null;
    @observable private _endNode: ICopySeqmentNode|null;
    @observable private _routePaths: ICopySeqmentRoutePath[];
    @observable private _highlightedRoutePath: ICopySeqmentRoutePath|null;
    @observable private _setNodeType: setNodeType;

    constructor() {
        this._isLoading = true;
        this._startNode = null;
        this._endNode = null;
        this._routePaths = [];
        this._highlightedRoutePath = null;
        this._setNodeType = 'startNode';
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

    @computed
    get highlightedRoutePath(): ICopySeqmentRoutePath|null {
        return this._highlightedRoutePath;
    }

    @computed
    get setNodeType(): setNodeType {
        return this._setNodeType;
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
    public setHighlightedRoutePath = (highlightedRoutePath: ICopySeqmentRoutePath|null) => {
        this._highlightedRoutePath = highlightedRoutePath;
    }

    @action
    public setSetNodeType = (_setNodeType: setNodeType) => {
        this._setNodeType = _setNodeType;
    }

    @action
    public clear = () => {
        this._startNode = null;
        this._endNode = null;
        this._routePaths = [];
        this._highlightedRoutePath = null;
        this._setNodeType = 'startNode';
    }

    public getSegmentLinksToCopy = (
        routePath: ICopySeqmentRoutePath, startNodeId: string, endNodeId: string,
    ) => {
        const startLinkOrderNumber = this._getStartLinkOrderNumber(routePath.links, startNodeId);
        const endLinkOrderNumber = this._getEndLinkOrderNumber(routePath.links, endNodeId);

        return routePath.links.filter((link: ICopySeqmentLink) => {
            return link.orderNumber >= startLinkOrderNumber
                && link.orderNumber <= endLinkOrderNumber;
        });
    }

    public getSegmentLinksNotToCopy = (
        routePath: ICopySeqmentRoutePath, startNodeId: string, endNodeId: string,
    ) => {
        const startLinkOrderNumber = this._getStartLinkOrderNumber(routePath.links, startNodeId);
        const endLinkOrderNumber = this._getEndLinkOrderNumber(routePath.links, endNodeId);

        return routePath.links.filter((link: ICopySeqmentLink) => {
            return link.orderNumber < startLinkOrderNumber
                || link.orderNumber > endLinkOrderNumber;
        });
    }

    private _getStartLinkOrderNumber = (links: ICopySeqmentLink[], startNodeId: string) => {
        return links
            .find((link: ICopySeqmentLink) => link.startNodeId === startNodeId)!.orderNumber;
    }

    private _getEndLinkOrderNumber = (links: ICopySeqmentLink[], endNodeId: string) => {
        return links
            .find((link: ICopySeqmentLink) => link.endNodeId === endNodeId)!.orderNumber;
    }
}

export default new RoutePathCopySeqmentStore();

export {
    RoutePathCopySeqmentStore,
    ICopySeqmentNode,
    ICopySeqmentLink,
    ICopySeqmentRoutePath,
    setNodeType,
};
