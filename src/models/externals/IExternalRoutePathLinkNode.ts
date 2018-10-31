import IExternalNode from './IExternalNode';

export default interface IExternalRoutePathLinkNode {
    linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu: {
        geojson: string,
    };
    lnkalkusolmu: string;
    lnkloppusolmu: string;
    lnkverkko: string;
    relid: string;
    reljarjnro: number;
    relpysakki: string;
    solmuByLnkalkusolmu: IExternalNode;
    solmuByLnkloppusolmu: IExternalNode;
}
