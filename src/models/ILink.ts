import * as L from 'leaflet';
import municipality from '~/enums/municipality';
import TransitType from '~/enums/transitType';
import INode from './INode';

export default interface ILink {
    transitType: TransitType;
    geometry: L.LatLng[];
    startNode: INode;
    endNode: INode;
    municipality: municipality;
    streetName: string;
    length: number;
    measuredLength: number;
    streetNumber: string;
    modifiedBy: string;
    modifiedOn: Date;
}
