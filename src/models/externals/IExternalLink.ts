import NodeType from '~/enums/nodeType';
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
    speed?: number;
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

interface IExternalNetworkSelectLink {
    lnkverkko: TransitType;
    geojson: string;
    lnkalkusolmu: string;
    lnkloppusolmu: string;
    dateRanges?: string;
    startNodeTransitTypes: string;
    startNodeType: NodeType;
    endNodeTransitTypes: string;
    endNodeType: NodeType;
}

export default IExternalLink;

export { IExternalRoutePathSegmentLink, IExternalNetworkSelectLink };
