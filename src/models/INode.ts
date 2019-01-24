import * as L from 'leaflet';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import IStop from './IStop';

export default interface INode {
    id: string;
    shortId?: string;
    stop?: IStop;
    type: NodeType;
    transitTypes: TransitType[];
    coordinates: L.LatLng;
    measurementDate: string;
    modifiedOn: string;
    modifiedBy: string;
}
