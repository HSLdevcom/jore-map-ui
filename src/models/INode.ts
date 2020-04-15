import * as L from 'leaflet';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import IStop from './IStop';

interface INodePrimaryKey {
    id: string;
    idSuffix?: string; // 2 num (used at manual nodeId input)
}

interface INodeBase extends INodePrimaryKey {
    shortIdLetter?: string;
    shortIdString?: string;
    type: NodeType;
    transitTypes?: TransitType[];
}

interface INodeMapHighlight extends INodePrimaryKey {
    coordinates: L.LatLng;
    type: NodeType;
    dateRanges: string;
    transitTypes: TransitType[];
}

interface INode extends INodeBase {
    stop: IStop | null;
    coordinates: L.LatLng;
    coordinatesProjection: L.LatLng;
    measurementDate?: Date;
    measurementType?: string;
    modifiedOn?: Date;
    modifiedBy?: string;
}

export default INode;

export { INodePrimaryKey, INodeBase, INodeMapHighlight };
