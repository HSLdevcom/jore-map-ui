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
}

interface INodeMapHighlight extends INodePrimaryKey {
    coordinates: L.LatLng;
    transitTypes: TransitType[];
    dateRanges: string;
}

interface INode extends INodeBase {
    stop: IStop | null;
    coordinates: L.LatLng;
    coordinatesProjection: L.LatLng;
    measurementDate?: Date;
    measurementType?: string;
    modifiedOn?: Date;
    modifiedBy?: string;
    transitTypes?: TransitType[];
}

interface IRoutePathSegmentNode {
    nodeId: string;
    geometry: L.LatLng;
}

export default INode;

export { INodePrimaryKey, INodeBase, INodeMapHighlight, IRoutePathSegmentNode };
