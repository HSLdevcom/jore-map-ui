import { action, computed, observable } from 'mobx';
import * as L from 'leaflet';
import { INode } from '~/models';
import { IRoutePathPrimaryKey } from '~/models/IRoutePath';

interface ICopySegmentNode {
    nodeId: string;
    geometry: L.LatLng;
}

interface ICopySegmentLink {
    geometry: L.LatLng[];
    startNodeId: string;
    endNodeId: string;
    orderNumber: number;
    routePathLinkId: number;
}

interface ICopySegmentRoutePath extends IRoutePathPrimaryKey {
    endTime: Date;
    originFi: string;
    destinationFi: string;
    links: ICopySegmentLink[];
}

// which type of node will be set next when a node is selected on map
type setNodeType = 'startNode' | 'endNode';

class RoutePathCopySegmentStore {
    @observable private _isLoading: boolean;
    @observable private _startNode: ICopySegmentNode | null;
    @observable private _endNode: ICopySegmentNode | null;
    @observable private _routePaths: ICopySegmentRoutePath[];
    @observable private _highlightedRoutePath: ICopySegmentRoutePath | null;
    @observable private _setNodeType: setNodeType;
    @observable private _areNodePositionsValid: boolean;

    constructor() {
        this._isLoading = true;
        this._startNode = null;
        this._endNode = null;
        this._routePaths = [];
        this._highlightedRoutePath = null;
        this._setNodeType = 'startNode';
        this._areNodePositionsValid = true;
    }

    @computed
    get isLoading(): boolean {
        return this._isLoading;
    }

    @computed
    get startNode(): ICopySegmentNode | null {
        return this._startNode;
    }

    @computed
    get endNode(): ICopySegmentNode | null {
        return this._endNode;
    }

    @computed
    get routePaths(): ICopySegmentRoutePath[] {
        return this._routePaths;
    }

    @computed
    get highlightedRoutePath(): ICopySegmentRoutePath | null {
        return this._highlightedRoutePath;
    }

    @computed
    get setNodeType(): setNodeType {
        return this._setNodeType;
    }

    @computed
    get areNodePositionsValid(): boolean {
        return this._areNodePositionsValid;
    }

    @action
    public setIsLoading = (isLoading: boolean) => {
        this._isLoading = isLoading;
    };

    @action
    public setStartNode = (node: INode) => {
        this._startNode = {
            nodeId: node.id,
            geometry: node.coordinates
        };
    };

    @action
    public setEndNode = (node: INode) => {
        this._endNode = {
            nodeId: node.id,
            geometry: node.coordinates
        };
    };

    @action
    public setRoutePaths = (routePaths: ICopySegmentRoutePath[]) => {
        this._routePaths = routePaths;
    };

    @action
    public setHighlightedRoutePath = (highlightedRoutePath: ICopySegmentRoutePath | null) => {
        this._highlightedRoutePath = highlightedRoutePath;
    };

    @action
    public setSetNodeType = (_setNodeType: setNodeType) => {
        this._setNodeType = _setNodeType;
    };

    @action
    public setNodePositionValidity = (areNodePositionsValid: boolean) => {
        this._areNodePositionsValid = areNodePositionsValid;
    };

    @action
    public clear = () => {
        this._startNode = null;
        this._endNode = null;
        this._routePaths = [];
        this._highlightedRoutePath = null;
        this._setNodeType = 'startNode';
    };

    public getSegmentLinksToCopy = (
        routePath: ICopySegmentRoutePath,
        startNodeId: string,
        endNodeId: string
    ) => {
        const startLinkOrderNumber = this._getStartLinkOrderNumber(routePath.links, startNodeId);
        const endLinkOrderNumber = this._getEndLinkOrderNumber(routePath.links, endNodeId);

        return routePath.links.filter((link: ICopySegmentLink) => {
            return (
                link.orderNumber >= startLinkOrderNumber && link.orderNumber <= endLinkOrderNumber
            );
        });
    };

    public getSegmentLinksNotToCopy = (
        routePath: ICopySegmentRoutePath,
        startNodeId: string,
        endNodeId: string
    ) => {
        const startLinkOrderNumber = this._getStartLinkOrderNumber(routePath.links, startNodeId);
        const endLinkOrderNumber = this._getEndLinkOrderNumber(routePath.links, endNodeId);

        return routePath.links.filter((link: ICopySegmentLink) => {
            return link.orderNumber < startLinkOrderNumber || link.orderNumber > endLinkOrderNumber;
        });
    };

    private _getStartLinkOrderNumber = (links: ICopySegmentLink[], startNodeId: string) => {
        return links.find((link: ICopySegmentLink) => link.startNodeId === startNodeId)!
            .orderNumber;
    };

    private _getEndLinkOrderNumber = (links: ICopySegmentLink[], endNodeId: string) => {
        return links.find((link: ICopySegmentLink) => link.endNodeId === endNodeId)!.orderNumber;
    };
}

export default new RoutePathCopySegmentStore();

export {
    RoutePathCopySegmentStore,
    ICopySegmentNode,
    ICopySegmentLink,
    ICopySegmentRoutePath,
    setNodeType
};
