import TransitType from '~/enums/transitType';
import IExternalNode from './IExternalNode';

interface IExternalLink {
    lnkverkko: TransitType;
    geojson: string;
    solmuByLnkalkusolmu: IExternalNode;
    solmuByLnkloppusolmu: IExternalNode;
    lnkalkusolmu?: string;
    lnkloppusolmu?: string;
    lnkmitpituus?: number;
    lnkpituus: number;
    kaoosnro: string;
    lnkosnro: string;
    lnksuunta: string;
    lnkstid: string;
    lnkkuka?: string;
    lnkviimpvm?: Date;
    dateRanges?: string;
}

interface IExternalRoutePathSegmentLink {
    reitunnus: string;
    suusuunta: string;
    suuvoimast: Date;
    relid: number;
    reljarjnro: number;
    lnkalkusolmu: string;
    lnkloppusolmu: string;
    suuvoimviimpvm: Date;
    suulahpaik: string;
    suupaapaik: string;
    geom: string;
}

export default IExternalLink;

export { IExternalRoutePathSegmentLink };
