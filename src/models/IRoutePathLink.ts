import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import NodeType from '~/enums/nodeType';
import INode from './INode';

export default interface IRoutePathLink {
    routeId?: string;
    routePathDirection?: string;
    routePathStartDate?: Date;
    transitType: TransitType;
    id: string;
    geometry: L.LatLng[];
    startNode: INode;
    endNode: INode;
    orderNumber: number;
    startNodeType: NodeType;
    isStartNodeTimeAlignmentStop: boolean;
}
