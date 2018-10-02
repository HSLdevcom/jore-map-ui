import { IRoutePath, IRoute } from '../models';

export default class NodeHelper {
    public static getNodeIdsUsedByRoutes(routes: IRoute[]): string[] {
        return routes
            .reduce<string[]>((flatlist, route) =>
            NodeHelper.getUniqueNumbers(
                    flatlist.concat(
                        NodeHelper.getNodeIdsUsedByRoutePaths(route.routePaths),
                    ),
                ),
                              [],
            );
    }

    public static getNodeIdsUsedByRoutePaths(routePaths: IRoutePath[]): string[] {
        return routePaths
            .reduce<string[]>((flatlist, routePath) =>
            NodeHelper.getUniqueNumbers(
                    flatlist.concat(
                        NodeHelper.getNodeIdsUsedByRoutePath(routePath),
                    ),
                ),
                              [],
            );
    }

    public static getNodeIdsUsedByRoutePath(routePath: IRoutePath): string[] {
        return routePath.routePathLinks
            .reduce<string[]>((flatlist, routePathLink) =>
            NodeHelper.getUniqueNumbers(
                    flatlist.concat(
                        routePathLink.endNodeId,
                        routePathLink.startNodeId,
                    ),
                ),
                              [],
            );
    }

    public static getUniqueNumbers(numbers: string[]): string[] {
        const seen = {};
        return numbers.filter(num =>
            seen.hasOwnProperty(num) ? false : (seen[num] = true),
        );
    }

    public static routePathHasStop(routePaths: IRoutePath[], nodeId: string) {
        return routePaths.some(routePath =>
            routePath.routePathLinks.some(routePathLink =>
                (
                    routePathLink.endNodeId === nodeId
                    || routePathLink.startNodeId === nodeId
                ),
            ),
        );
    }
}
