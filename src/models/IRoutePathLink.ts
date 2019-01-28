import * as L from 'leaflet';
import NodeType from '~/enums/nodeType';
import INode from './INode';

export default interface IRoutePathLink {
    routeId?: string;
    routePathDirection?: string;
    routePathStartDate?: Date;
    id: string;
    geometry: L.LatLng[];
    startNode: INode;
    endNode: INode;
    orderNumber: number;
    startNodeType: NodeType;
    isStartNodeTimeAlignmentStop: boolean;
}
