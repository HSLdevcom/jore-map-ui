import { IRoutePath, IRoute } from '../models';

export default class NodeHelper {
    public static getNodeIdsUsedByRoutes(routes: IRoute[]): number[] {
        return routes
            .reduce<number[]>((flatlist, route) =>
            NodeHelper.getUniqueNumbers(
                    flatlist.concat(
                        NodeHelper.getNodeIdsUsedByRoutePaths(route.routePaths),
                    ),
                ),
                              [],
            );
    }

    public static getNodeIdsUsedByRoutePaths(routePaths: IRoutePath[]): number[] {
        return routePaths
            .reduce<number[]>((flatlist, routePath) =>
            NodeHelper.getUniqueNumbers(
                    flatlist.concat(
                        NodeHelper.getNodeIdsUsedByRoutePath(routePath),
                    ),
                ),
                              [],
            );
    }

    public static getNodeIdsUsedByRoutePath(routePath: IRoutePath): number[] {
        return routePath.routePathLinks
            .reduce<number[]>((flatlist, routePathLink) =>
            NodeHelper.getUniqueNumbers(
                    flatlist.concat(
                        routePathLink.endNode,
                        routePathLink.startNode,
                    ),
                ),
                              [],
            );
    }

    public static getUniqueNumbers(numbers: number[]): number[] {
        const seen = {};
        return numbers.filter(num =>
            seen.hasOwnProperty(num) ? false : (seen[num] = true),
        );
    }

    public static routePathHasStop(routePaths: IRoutePath[], nodeId: number) {
        return routePaths.some(routePath =>
            routePath.routePathLinks.some(routePathLink =>
                (
                    routePathLink.endNode === nodeId
                    || routePathLink.startNode === nodeId
                ),
            ),
        );
    }
}
