import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import INode from './INode';

interface ILinkPrimaryKey {
    transitType?: TransitType;
    startNode: INode;
    endNode: INode;
}

interface ILinkMapHighlight {
    transitType: TransitType;
    startNodeId: string;
    endNodeId: string;
    geometry: L.LatLng[];
    dateRanges: string;
}

interface ILink extends ILinkPrimaryKey {
    geometry: L.LatLng[];
    length: number;
    speed: number;
    measuredLength?: number;
    modifiedBy?: string;
    modifiedOn?: Date;
}

export default ILink;

export { ILinkPrimaryKey, ILinkMapHighlight };
