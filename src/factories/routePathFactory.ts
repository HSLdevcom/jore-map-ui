import { IRoutePath, INode } from '../models';
import HashHelper from '../util/hashHelper';
import RoutePathLinkFactory, { IRoutePathLinkResult } from './routePathLinkFactory';
import QueryParsingHelper from './queryParsingHelper';

export interface IRoutePathResult {
    routePath: IRoutePath;
    nodes: INode[];
}

class RoutePathFactory {
    // suunta to IRoutePath
    public static createRoutePath = (
        routeId: string,
        suunta: any,
        isVisible:boolean,
    ): IRoutePathResult => {
        const internalRoutePathId = HashHelper.getHashFromString(
            [
                routeId,
                suunta.suunimi,
                suunta.suuvoimast,
                suunta.suuvoimviimpvm,
                suunta.suusuunta,
            ].join('-'),
        ).toString();

        const routePathLinks:IRoutePathLinkResult[]
        = suunta.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.edges
            .map((node: any) =>
                RoutePathLinkFactory.createRoutePathLink(node.node));

        const coordinates = JSON.parse(suunta.geojson).coordinates;
        const positions = coordinates.map((coor: [number, number]) => [coor[1], coor[0]]);

        const routePath : IRoutePath = {
            routeId,
            positions,
            routePathLinks: routePathLinks.map(res => res.link),
            internalId: internalRoutePathId,
            geoJson: JSON.parse(suunta.geojson),
            routePathName: suunta.suunimi,
            direction: suunta.suusuunta,
            startTime: new Date(suunta.suuvoimast),
            endTime: new Date(suunta.suuviimpvm),
            lastModified: new Date(suunta.suuvoimviimpvm),
            visible: isVisible,
        };

        return {
            routePath,
            nodes: QueryParsingHelper.removeINodeDuplicates(
                routePathLinks.reduce<INode[]>((flatList, node) => flatList.concat(node.nodes), []),
            ),
        };
    }
}

export default RoutePathFactory;
