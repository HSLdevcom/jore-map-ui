import TransitType from '~/enums/transitType';
import IExternalNode from './IExternalNode';
import IExternalLink from './IExternalLink';

export default interface IExternalRoutePathLink {
    linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu: IExternalLink;
    solmuByLnkalkusolmu: IExternalNode;
    solmuByLnkloppusolmu: IExternalNode;
    reitunnus: string;
    suusuunta: string;
    suuvoimast: string;
    relid: number;
    reljarjnro: number;
    relohaikpys: string;
    relpysakki: string;
    lnkverkko: TransitType;
    ajantaspys: string;
    paikka: string;
    kirjaan: string;
    kirjasarake: number;
    relkuka: string;
    relviimpvm: string;
}
