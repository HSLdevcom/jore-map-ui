import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import INode from './INode';

interface IRoutePathLinkPrimaryKey {
    id: string;
}

export default interface IRoutePathLink extends IRoutePathLinkPrimaryKey {
    geometry: L.LatLng[];
    orderNumber: number;
    transitType: TransitType;
    startNode: INode;
    endNode: INode;
    startNodeUsage: string;
    startNodeType: string;
    startNodeTimeAlignmentStop: string;
    isStartNodeHastusStop: boolean;
    isStartNodeUsingBookSchedule: boolean;
    startNodeBookScheduleColumnNumber: number | null;
    modifiedBy: string;
    modifiedOn: Date;
}

export { IRoutePathLinkPrimaryKey };
