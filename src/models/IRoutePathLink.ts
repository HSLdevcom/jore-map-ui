import NodeType from '~/enums/nodeType';
import INode from './INode';

export default interface IRoutePathLink {
    routeId?: string;
    routePathDirection?: string;
    routePathStartDate?: Date;
    id: string;
    positions: [[number, number]]; // TODO: use geojson format instead (?)
    startNode: INode;
    endNode: INode;
    orderNumber: number;
    startNodeType: NodeType;
    isStartNodeTimeAlignmentStop: boolean;
}
