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
    transitType: TransitType;
    geometry: L.LatLng[];
    startNode: INode;
    endNode: INode;
    orderNumber: number;
    startNodeType: NodeType;
    isStartNodeTimeAlignmentStop: boolean;
    isStartNodeHastusStop: boolean;
    isStartNodeUsingBookSchedule: boolean;
    startNodeColumnNumber: number | null;
    modifiedBy: string;
    modifiedOn: Date;
}

export { IRoutePathLinkPrimaryKey };
