
interface RoutePathLinkNode {
    geojson: string;
    geojsonManual: string;
    pysakkiBySoltunnus: string;
    soltunnus: string;
    soltyyppi: string;
    solx: string;
    soly: string;
}

export default interface IExternalRoutePathLinkNode {
    linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu: {
        geojson: string,
    };
    lnkalkusolmu: string;
    lnkloppusolmu: string;
    lnkverkko: string;
    relid: string;
    reljarjnro: number;
    solmuByLnkalkusolmu: RoutePathLinkNode;
    solmuByLnkloppusolmu: RoutePathLinkNode;
}
