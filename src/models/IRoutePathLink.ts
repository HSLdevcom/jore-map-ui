import INode from './INode';

export default interface IRoutePathLink {
    id: string;
    positions: [[number, number]];
    startNode: INode | null;
    endNode: INode | null;
    orderNumber: number;
    startNodeType: string;
    timeAlignmentStop: string;
}
