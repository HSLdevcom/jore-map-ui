import NodeType from '~/enums/nodeType';
import INode from './INode';

export default interface IRoutePathLink {
    id: string;
    positions: [[number, number]];
    startNode: INode;
    endNode: INode;
    orderNumber: number;
    startNodeType: NodeType;
    isStartNodeTimeAlignmentStop: boolean;
}
