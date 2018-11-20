import IExternalNode from './IExternalNode';

export default interface IExternalLink {
    lnkverkko: string;
    geojson: string;
    solmuByLnkalkusolmu: IExternalNode;
    solmuByLnkloppusolmu: IExternalNode;
}
