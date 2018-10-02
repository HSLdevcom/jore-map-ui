import NodeType from '../enums/nodeType';
import INodeStop from './INodeStop';
import { ICoordinate } from '.';

export default interface INode {
    id: string;
    stop: INodeStop|null;
    type: NodeType;
    coordinates: ICoordinate;
    jore_mittpvm: string;
    jore_solviimpvm: string;
    jore_solkuka: string;
}
