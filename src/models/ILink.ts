import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import INode from './INode';

export default interface ILink {
    transitType: TransitType;
    geometry: L.LatLng[];
    startNode: INode;
    endNode: INode;
    municipalityCode: string;
    streetName: string;
    length: number;
    measuredLength: number;
    streetNumber: string;
    osNumber: string;
    direction: string;
    modifiedBy: string;
    modifiedOn: Date;
}
