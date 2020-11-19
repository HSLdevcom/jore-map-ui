import { action, computed, observable } from 'mobx';
import { IRoutePathSegment } from '~/models/IRoutePath';
import { IRoutePathSegmentLink } from '~/models/IRoutePathLink';

// Which type of node will be set next when a node is selected on map
type setNodeType = 'startNode' | 'endNode';

// When selecting point from routePath, internalId needs to be known (to handle cases where the same nodeId appears twice)
interface ISegmentPoint {
    nodeInternalId?: string;
    nodeId: string;
    coordinates: L.LatLng;
}

interface IRoutesUsingLink {
    lineId: string;
    routeId: string;
    isExpanded: boolean;
    routePathSegments: IRoutePathSegment[];
}

class RoutePathCopySegmentStore {
    @observable private _isLoading: boolean;
    @observable private _startSegmentPoint: ISegmentPoint | null;
    @observable private _endSegmentPoint: ISegmentPoint | null;
    @observable private _routesUsingLink: IRoutesUsingLink[];
    @observable private _highlightedRoutePath: IRoutePathSegment | null;
    @observable private _setNodeType: setNodeType;
    @observable private _areNodePositionsValid: boolean;

    constructor() {
        this._isLoading = true;
        this._startSegmentPoint = null;
        this._endSegmentPoint = null;
        this._routesUsingLink = [];
        this._highlightedRoutePath = null;
        this._setNodeType = 'startNode';
        this._areNodePositionsValid = true;
    }

    @computed
    get isLoading(): boolean {
        return this._isLoading;
    }

    @computed
    get startSegmentPoint(): ISegmentPoint | null {
        return this._startSegmentPoint;
    }

    @computed
    get endSegmentPoint(): ISegmentPoint | null {
        return this._endSegmentPoint;
    }

    @computed
    get routesUsingLink(): IRoutesUsingLink[] {
        return this._routesUsingLink;
    }

    @computed
    get highlightedRoutePath(): IRoutePathSegment | null {
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
    public setStartSegmentPoint = (segmentPoint: ISegmentPoint) => {
        this._startSegmentPoint = segmentPoint;
    };

    @action
    public setEndSegmentPoint = (segmentPoint: ISegmentPoint) => {
        this._endSegmentPoint = segmentPoint;
    };

    @action
    public setRoutesUsingLink = (routesUsingLink: IRoutesUsingLink[]) => {
        this._routesUsingLink = routesUsingLink;
    };

    @action
    public setHighlightedRoutePath = (highlightedRoutePath: IRoutePathSegment | null) => {
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
        this._startSegmentPoint = null;
        this._endSegmentPoint = null;
        this._highlightedRoutePath = null;
        this._setNodeType = 'startNode';
        this._routesUsingLink = [];
    };

    public getSegmentLinksToCopy = (
        routePath: IRoutePathSegment,
        startNodeId: string,
        endNodeId: string
    ): IRoutePathSegmentLink[] => {
        const startLinkOrderNumber = this._getStartLinkOrderNumber(routePath.links, startNodeId);
        const endLinkOrderNumber = this._getEndLinkOrderNumber(routePath.links, endNodeId);

        return routePath.links.filter((link: IRoutePathSegmentLink) => {
            return (
                link.orderNumber >= startLinkOrderNumber && link.orderNumber <= endLinkOrderNumber
            );
        });
    };

    public getSegmentLinksNotToCopy = (
        routePath: IRoutePathSegment,
        startNodeId: string,
        endNodeId: string
    ) => {
        const startLinkOrderNumber = this._getStartLinkOrderNumber(routePath.links, startNodeId);
        const endLinkOrderNumber = this._getEndLinkOrderNumber(routePath.links, endNodeId);

        return routePath.links.filter((link: IRoutePathSegmentLink) => {
            return link.orderNumber < startLinkOrderNumber || link.orderNumber > endLinkOrderNumber;
        });
    };

    private _getStartLinkOrderNumber = (links: IRoutePathSegmentLink[], startNodeId: string) => {
        return links.find((link: IRoutePathSegmentLink) => link.startNodeId === startNodeId)!
            .orderNumber;
    };

    private _getEndLinkOrderNumber = (links: IRoutePathSegmentLink[], endNodeId: string) => {
        return links.find((link: IRoutePathSegmentLink) => link.endNodeId === endNodeId)!
            .orderNumber;
    };
}

export default new RoutePathCopySegmentStore();

export { RoutePathCopySegmentStore, setNodeType, ISegmentPoint, IRoutesUsingLink };
