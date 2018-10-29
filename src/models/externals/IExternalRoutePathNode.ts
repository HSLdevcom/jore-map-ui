import IExternalRoutePath from './IExternalRoutePath';

export default interface IExternalroutePathNode {
    geojson: string;
    reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta: {
        edges: IExternalRoutePath[],
    };
    suulahpaik: string;
    suunimi: string;
    suupaapaik: string;
    suusuunta: string;
    suuviimpvm: string;
    suuvoimast: string;
    suuvoimviimpvm: string;
}
