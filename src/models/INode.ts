import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import IStop from './IStop';
import { ICoordinates } from '.';

export default interface INode {
    id: string;
    shortId?: string;
    stop?: IStop;
    type: NodeType;
    transitTypes: TransitType[];
    coordinates: ICoordinates;
    coordinatesManual: ICoordinates;
    coordinatesProjection: ICoordinates;
    measurementDate: string;
    modifiedOn: string;
    modifiedBy: string;
}
