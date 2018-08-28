import NodeType from '../enums/nodeType';
import { ICoordinate } from '.';

export default interface INode {
    routePathId: string;
    id: number;
    type: NodeType;
    coordinates: ICoordinate;
}
