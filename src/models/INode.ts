import NodeType from '../enums/nodeType';
import { ICoordinate } from '.';

export default interface INode {
    id: number;
    type: NodeType;
    geoJson: any;
    coordinates: ICoordinate;
}
