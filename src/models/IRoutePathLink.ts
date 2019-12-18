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
    startNodeUsage?: string;
    startNodeType: string;
    startNodeTimeAlignmentStop?: string;
    isStartNodeHastusStop?: boolean;
    isStartNodeUsingBookSchedule?: boolean;
    startNodeBookScheduleColumnNumber?: number;
    modifiedBy?: string;
    modifiedOn?: Date;
    // IViaName properties
    viaNameId?: string;
    destinationFi1?: string;
    destinationFi2?: string;
    destinationSw1?: string;
    destinationSw2?: string;
}

export { IRoutePathLinkPrimaryKey };
