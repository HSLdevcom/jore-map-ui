import { IRoute, ILine, INode } from '~/models';
import RoutePathFactory, { IRoutePathResult } from './routePathFactory';
import QueryParsingHelper from './queryParsingHelper';

export interface IRouteResult{
    nodes: INode[];
    route?: IRoute;
}

class RouteFactory {
    public static createRoute = (reitti: any, line?: ILine): IRouteResult => {
        const routePathResults:IRoutePathResult[]
            = reitti.reitinsuuntasByReitunnus.edges
                .map((routePath: any, index:number) => {
                    return RoutePathFactory.createRoutePath(
                        reitti.reitunnus, routePath.node);
                });

        const route = {
            line,
            routePaths: routePathResults
                .map(res => res.routePath)
                .sort((a, b) => b.endTime.unix() - a.endTime.unix()),
            routeName: reitti.reinimi,
            routeNameSwedish: reitti.reinimir,
            lineId: reitti.lintunnus,
            routeId: reitti.reitunnus,
        };

        return {
            route,
            nodes: QueryParsingHelper.removeINodeDuplicates(
                routePathResults
                    .reduce<INode[]>((flatList, node) => flatList.concat(node.nodes!), []),
            ),
        };
    }
}

export default RouteFactory;
