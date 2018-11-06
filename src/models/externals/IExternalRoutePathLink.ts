import IExternalNode from './IExternalNode';

export default interface IExternalRoutePathLink {
    startNode: IExternalNode;
    endNode: IExternalNode;
    geojson: string;
    ajantaspys: string;
    lnkalkusolmu: string;
    lnkloppusolmu: string;
    lnkverkko: string;
    relid: string;
    reljarjnro: number;
    relpysakki: string;
}
