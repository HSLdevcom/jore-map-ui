import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import INode from './INode';
import IViaName from './IViaName';

interface IRoutePathLinkPrimaryKey {
    id: string;
}

interface IRoutePathLink extends IRoutePathLinkPrimaryKey, IViaName {
    geometry: L.LatLng[];
    orderNumber: number;
    transitType: TransitType;
    startNode: INode;
    endNode: INode;
    startNodeUsage?: string;
    startNodeType: string;
    startNodeTimeAlignmentStop?: string;
    isStartNodeHastusStop?: boolean;
    isStartNodeUsingBookSchedule?: boolean;
    startNodeBookScheduleColumnNumber?: number;
    modifiedBy?: string;
    modifiedOn?: Date;
}

interface IRoutePathSegmentLink {
    geometry: L.LatLng[];
    startNodeId: string;
    endNodeId: string;
    orderNumber: number;
    routePathLinkId: number;
}

interface IRoutePathLinkSaveModel {
    added: IRoutePathLink[];
    modified: IRoutePathLink[];
    removed: IRoutePathLink[];
    originals: IRoutePathLink[];
}

export default IRoutePathLink;

export { IRoutePathLinkPrimaryKey, IRoutePathSegmentLink, IRoutePathLinkSaveModel };
