import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import NodeType from '~/enums/nodeType';
import IStop from './IStop';

interface INodePrimaryKey {
    id: string;
}

interface INodeBase extends INodePrimaryKey {
    shortIdLetter?: string;
    shortIdString?: string;
    type: NodeType;
}

export default interface INode extends INodeBase {
    stop?: IStop; // TODO: change as IStop|null
    transitTypes: TransitType[];
    coordinates: L.LatLng;
    coordinatesManual: L.LatLng;
    coordinatesProjection: L.LatLng;
    measurementDate: string;
    modifiedOn: string;
    modifiedBy: string;
}

export {
    INodePrimaryKey,
    INodeBase,
};
