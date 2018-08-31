import NodeType from '../enums/nodeType';
import { ICoordinate } from '.';

export default interface INode {
    internalRoutePathId: string;
    id: number;
    type: NodeType;
    coordinates: ICoordinate;
}
