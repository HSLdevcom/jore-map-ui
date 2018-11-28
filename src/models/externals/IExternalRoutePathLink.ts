import NodeType from '~/enums/nodeType';
import IExternalNode from './IExternalNode';
import IExternalLink from './IExternalLink';

export default interface IExternalRoutePathLink {
    link: IExternalLink;
    startNode: IExternalNode;
    endNode: IExternalNode;
    ajantaspys: string;
    lnkverkko: string;
    relid: string;
    reljarjnro: number;
    relpysakki: NodeType;
}
