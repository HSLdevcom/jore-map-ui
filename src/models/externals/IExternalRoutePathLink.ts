import IExternalNode from './IExternalNode';

export default interface IExternalRoutePathLink {
    geojson: string;
    ajantaspys: string;
    lnkalkusolmu: string;
    lnkloppusolmu: string;
    lnkverkko: string;
    relid: string;
    reljarjnro: number;
    relpysakki: string;
    startNode: IExternalNode;
    endNode: IExternalNode;
}
