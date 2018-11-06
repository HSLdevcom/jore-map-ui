import { IRoute, ILine, INode } from '~/models';
import IExternalRoute from '~/models/externals/IExternalRoute.ts';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath.ts';
import RoutePathFactory, { IRoutePathResult } from './routePathFactory';
import QueryParsingHelper from './queryParsingHelper';

export interface IRouteResult{
    nodes: INode[];
    route?: IRoute;
}
class RouteFactory {
    public static createRoute = (externalRoute: IExternalRoute, line?: ILine): IRouteResult => {
        const routePathResults:IRoutePathResult[]
            = externalRoute.externalRoutePaths
                .map((routePath: IExternalRoutePath) => {
                    return RoutePathFactory.createRoutePath(
                        externalRoute.reitunnus, routePath);
                });

        const route = {
            line,
            routePaths: routePathResults
                .map(res => res.routePath)
                .sort((a, b) => b.endTime.getTime() - a.endTime.getTime()),
            routeName: externalRoute.reinimi,
            routeNameSwedish: externalRoute.reinimir,
            lineId: externalRoute.lintunnus,
            routeId: externalRoute.reitunnus,
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
