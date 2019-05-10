import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import NodeType from '~/enums/nodeType';
import INode from './INode';

interface IRoutePathLinkPrimaryKey {
    id: string;
}

export default interface IRoutePathLink extends IRoutePathLinkPrimaryKey {
    routeId: string;
    routePathDirection: string;
    routePathStartDate: Date;
    geometry: L.LatLng[];
    orderNumber: number;
    transitType: TransitType;
    startNode: INode;
    endNode: INode;
    startNodeStopType: NodeType; // ei/otto/jättöpysäkki
    isStartNodeDisabled: boolean;
    isStartNodeTimeAlignmentStop: boolean;
    isStartNodeHastusStop: boolean;
    isStartNodeUsingBookSchedule: boolean;
    startNodeBookScheduleColumnNumber: number | null;
    modifiedBy: string;
    modifiedOn: Date;
}

export { IRoutePathLinkPrimaryKey };
