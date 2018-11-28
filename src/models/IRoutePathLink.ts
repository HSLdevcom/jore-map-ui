import NodeType from '~/enums/nodeType';
import INode from './INode';

export default interface IRoutePathLink {
    routeId?: string;
    routePathDirection?: number;
    routePathStartDate?: Date;
    id: string;
    positions: [[number, number]];
    startNode: INode;
    endNode: INode;
    orderNumber: number;
    startNodeType: NodeType;
    isStartNodeTimeAlignmentStop: boolean;
}
