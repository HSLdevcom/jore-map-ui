
export default interface IExternalRoutePathLinkNode {
    linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu: {
        geojson: string,
    };
    lnkalkusolmu: string;
    lnkloppusolmu: string;
    lnkverkko: string;
    relid: string;
    reljarjnro: number;
    solmuByLnkalkusolmu: Object;
    solmuByLnkloppusolmu: Object;
}
