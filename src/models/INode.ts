import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import IStop from './IStop';
import { ICoordinate } from '.';

export default interface INode {
    id: string;
    stop: IStop|null;
    type: NodeType;
    transitTypes: TransitType[];
    coordinates: ICoordinate;
    measurementDate: string;
    modifiedOn: string;
    modifiedBy: string;
}
