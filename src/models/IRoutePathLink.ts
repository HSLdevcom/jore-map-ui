import * as L from 'leaflet';
import StartNodeType from '~/enums/startNodeType';
import TransitType from '~/enums/transitType';
import INode from './INode';
import IViaName from './IViaName';
import IViaShieldName from './IViaShieldName';

interface IRoutePathLinkPrimaryKey {
    id: string;
}

interface IRoutePathNode extends IRoutePathLinkPrimaryKey, IViaName, IViaShieldName {
    startNodeUsage?: string;
    startNodeTimeAlignmentStop?: string;
    isStartNodeHastusStop?: boolean;
    isStartNodeUsingBookSchedule?: boolean;
    startNodeBookScheduleColumnNumber?: number;
    startNodeType?: StartNodeType;
}

interface IRoutePathLink extends IRoutePathNode {
    geometry: L.LatLng[];
    orderNumber: number;
    transitType: TransitType;
    startNode: INode;
    endNode: INode;
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

export { IRoutePathLinkPrimaryKey, IRoutePathSegmentLink, IRoutePathNode, IRoutePathLinkSaveModel };
