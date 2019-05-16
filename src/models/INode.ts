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
    stop: IStop | null;
    coordinates: L.LatLng;
    coordinatesManual: L.LatLng;
    coordinatesProjection: L.LatLng;
    measurementDate?: Date;
    tripTimePoint?: string;
    modifiedOn?: Date;
    modifiedBy?: string;
    transitTypes?: TransitType[];
}

export { INodePrimaryKey, INodeBase };
