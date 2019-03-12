import TransitType from '~/enums/transitType';
import IExternalNode from './IExternalNode';

export default interface IExternalLink {
    lnkverkko: TransitType;
    geojson: string;
    solmuByLnkalkusolmu: IExternalNode;
    solmuByLnkloppusolmu: IExternalNode;
    lnkmitpituus: number;
    lnkpituus: number;
    katkunta: string;
    katnimi: string;
    kaoosnro: string;
    lnkosnro: string;
    lnksuunta: string;
    lnkstid: string;
    lnkkuka: string;
    lnkviimpvm: string;
}
