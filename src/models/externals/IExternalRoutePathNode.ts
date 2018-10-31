import IExternalRoutePath from './IExternalRoutePath';

export default interface IExternalRoutePathNode {
    geojson: string;
    reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta: {
        nodes: IExternalRoutePath[],
    };
    suulahpaik: string;
    suunimi: string;
    suupaapaik: string;
    suusuunta: string;
    suuviimpvm: string;
    suuvoimast: string;
    suuvoimviimpvm: string;
}
