import NodeType from '../enums/nodeType';
import { ICoordinate } from '.';

export default interface INode {
    id: string;
    type: NodeType;
    coordinates: ICoordinate;
    jore_mittpvm: string;
    jore_solviimpvm: string;
    jore_solkuka: string;
}
