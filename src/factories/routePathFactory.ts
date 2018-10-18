import moment from 'moment';
import { IRoutePath, INode } from '~/models';
import HashHelper from '~/util/hashHelper';
import RoutePathLinkFactory, { IRoutePathLinkResult } from './routePathLinkFactory';
import QueryParsingHelper from './queryParsingHelper';

export interface IRoutePathResult {
    routePath: IRoutePath;
    nodes: INode[] | null;
}

class RoutePathFactory {
    // suunta to IRoutePath
    public static createRoutePath = (
        routeId: string,
        suunta: any,
    ): IRoutePathResult => {
        const internalRoutePathId = HashHelper.getHashFromString(
            [
                routeId,
                suunta.suuvoimast,
                suunta.suusuunta,
            ].join('-'),
        ).toString();

        const routePathLinkResult:IRoutePathLinkResult[] | null
        = suunta.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta ?
            suunta.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.edges
            .map((routePathLinkNode: any) =>
                RoutePathLinkFactory.createRoutePathLink(routePathLinkNode.node)) : null;

        const coordinates = suunta.geojson ? JSON.parse(suunta.geojson).coordinates : null;
        const positions = coordinates
            ? coordinates.map((coor: [number, number]) => [coor[1], coor[0]]) : null;

        const routePath : IRoutePath = {
            routeId,
            positions,
            routePathLinks: routePathLinkResult ? routePathLinkResult.map(res => res.link) : null,
            internalId: internalRoutePathId,
            geoJson: suunta.geojson ? JSON.parse(suunta.geojson) : null,
            routePathName: suunta.suunimi,
            routePathNameSw: suunta.suunimir,
            direction: suunta.suusuunta,
            startTime: moment(suunta.suuvoimast),
            endTime: moment(suunta.suuvoimviimpvm),
            lastModified: new Date(suunta.suuviimpvm),
            visible: false,
            originFi: suunta.suulahpaik,
            originSw: suunta.suulahpaikr,
            destinationFi: suunta.suupaapaik,
            destinationSw: suunta.suupaapaikr,
            routePathShortName: suunta.suunimilyh,
            routePathShortNameSw: suunta.suunimilyhr,
        };

        return {
            routePath,
            nodes: routePathLinkResult ? QueryParsingHelper.removeINodeDuplicates(
                routePathLinkResult
                    .reduce<INode[]>((flatList, node) => flatList.concat(node.nodes), []),
            ) : null,
        };
    }
}

export default RoutePathFactory;
