import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import INode from './INode';

interface ILinkPrimaryKey {
    transitType?: TransitType;
    startNode: INode;
    endNode: INode;
}

export default interface ILink extends ILinkPrimaryKey {
    geometry: L.LatLng[];
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

export {
    ILinkPrimaryKey,
};
