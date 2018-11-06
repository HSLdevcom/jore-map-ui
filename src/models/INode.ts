import NodeType from '~/enums/nodeType';
import IStop from './IStop';
import { ICoordinate } from '.';

export default interface INode {
    id: string;
    stop: IStop|null;
    type: NodeType;
    coordinates: ICoordinate;
    measurementDate: string;
    modifiedOn: string;
    modifiedBy: string;
}
