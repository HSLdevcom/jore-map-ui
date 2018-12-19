import TransitType from '~/enums/transitType';
import INode from './INode';

export default interface ILink {
    transitType: TransitType;
    positions: [[number, number]]; // TODO: use geojson format instead (?)
    startNode: INode;
    endNode: INode;
}
