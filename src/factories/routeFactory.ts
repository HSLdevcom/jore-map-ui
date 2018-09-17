import { IRoute, ILine, INode } from '../models';
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
                    // By default make the first two routePaths visible
                    const isVisible = (index <= 1);

                    return RoutePathFactory.createRoutePath(
                        reitti.reitunnus, routePath.node, isVisible);
                });

        const route = {
            line,
            routePaths: routePathResults.map(res => res.routePath),
            routeName: reitti.reinimi,
            routeNameSwedish: reitti.reinimir,
            lineId: reitti.lintunnus,
            routeId: reitti.reitunnus,
        };

        return {
            route,
            nodes: QueryParsingHelper.removeINodeDuplicates(
                routePathResults
                    .reduce<INode[]>((flatList, node) => flatList.concat(node.nodes), []),
            ),
        };
    }
}

export default RouteFactory;
