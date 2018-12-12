import NodeType from '~/enums/nodeType';
import IExternalNode from './IExternalNode';
import IExternalLink from './IExternalLink';

export default interface IExternalRoutePathLink {
    linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu: IExternalLink;
    solmuByLnkalkusolmu: IExternalNode;
    solmuByLnkloppusolmu: IExternalNode;
    ajantaspys: string;
    lnkverkko: string;
    relid: string;
    reljarjnro: number;
    relpysakki: NodeType;
    suusuunta: string;
    suuvoimast: string;
    reitunnus: string;
}
