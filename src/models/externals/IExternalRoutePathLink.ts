import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import IExternalNode from './IExternalNode';
import IExternalLink from './IExternalLink';

export default interface IExternalRoutePathLink {
    linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu: IExternalLink;
    solmuByLnkalkusolmu: IExternalNode;
    solmuByLnkloppusolmu: IExternalNode;
    ajantaspys: string;
    paikka: string;
    kirjaan: string;
    kirjasarake: number;
    lnkverkko: TransitType;
    relid: string;
    reljarjnro: number;
    relpysakki: NodeType;
    suusuunta: string;
    suuvoimast: string;
    reitunnus: string;
}
