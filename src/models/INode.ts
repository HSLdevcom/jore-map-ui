import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import IStop from './IStop';
import INodeBase from './baseModels/INodeBase';

export default interface INode extends INodeBase {
    stop?: IStop;
    transitTypes: TransitType[];
    coordinates: L.LatLng;
    coordinatesManual: L.LatLng;
    coordinatesProjection: L.LatLng;
    measurementDate: string;
    modifiedOn: string;
    modifiedBy: string;
}
