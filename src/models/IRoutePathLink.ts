import * as L from 'leaflet';
import StartNodeType from '~/enums/startNodeType';
import TransitType from '~/enums/transitType';
import INode from './INode';
import IViaName from './IViaName';
import IViaShieldName from './IViaShieldName';

interface IRoutePathLinkPrimaryKey {
    id: string;
}

interface IRoutePathLink extends IRoutePathLinkPrimaryKey, IViaName, IViaShieldName {
    geometry: L.LatLng[];
    orderNumber: number;
    transitType: TransitType;
    startNode: INode;
    endNode: INode;
    startNodeUsage?: string;
    startNodeType: StartNodeType;
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
