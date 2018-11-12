import NodeType from '~/enums/nodeType';
import IExternalNode from './IExternalNode';

export default interface IExternalRoutePathLink {
    startNode: IExternalNode;
    endNode: IExternalNode;
    geojson: string;
    ajantaspys: string;
    lnkverkko: string;
    relid: string;
    reljarjnro: number;
    relpysakki: NodeType;
}
