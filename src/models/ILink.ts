import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import INode from './INode';

export default interface ILink {
    transitType: TransitType;
    geometry: L.LatLng[];
    startNode: INode;
    endNode: INode;
}
