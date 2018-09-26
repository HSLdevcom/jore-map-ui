import NodeType from '../enums/nodeType';
import INodeStop from './INodeStop';
import { ICoordinate } from '.';

export default interface INode {
    id: number;
    stop: INodeStop|null;
    type: NodeType;
    coordinates: ICoordinate;
}
