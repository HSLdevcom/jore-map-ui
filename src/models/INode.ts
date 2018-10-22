import NodeType from '~/enums/nodeType';
import INodeStop from './INodeStop';
import { ICoordinate } from '.';

export default interface INode {
    id: string;
    stop: INodeStop|null;
    type: NodeType;
    coordinates: ICoordinate;
    measurementDate: string;
    modifiedOn: string;
    modifiedBy: string;
    disabled?: boolean;
}
