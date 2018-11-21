import NodeType from '~/enums/nodeType';
import INode from './INode';

export default interface ILink {
    id: string;
    positions: [[number, number]];
    startNode: INode;
    endNode: INode;
    startNodeType: NodeType;
}
