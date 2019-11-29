import * as L from 'leaflet';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import IStop from './IStop';

interface INodePrimaryKey {
    id: string;
}

interface INodeBase extends INodePrimaryKey {
    shortIdLetter?: string;
    shortIdString?: string;
    type: NodeType;
}

interface INodeMapHighlight extends INodePrimaryKey {
    coordinates: L.LatLng;
    dateRanges: string;
}

export default interface INode extends INodeBase {
    stop: IStop | null;
    coordinates: L.LatLng;
    coordinatesProjection: L.LatLng;
    measurementDate?: Date;
    measurementType?: string;
    tripTimePoint?: string;
    modifiedOn?: Date;
    modifiedBy?: string;
    transitTypes?: TransitType[];
}

export { INodePrimaryKey, INodeBase, INodeMapHighlight };
