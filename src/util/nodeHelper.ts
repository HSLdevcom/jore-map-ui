import { IRoutePath, IRoute } from '~/models';

export default class NodeHelper {
    public static getNodeIdsUsedByRoutes(routes: IRoute[]): string[] {
        return routes
            .reduce<string[]>((flatlist, route) =>
            NodeHelper.getUniqueIds(
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
            NodeHelper.getUniqueIds(
                    flatlist.concat(
                        NodeHelper.getNodeIdsUsedByRoutePath(routePath),
                    ),
                ),
                              [],
            );
    }

    public static getNodeIdsUsedByRoutePath(routePath: IRoutePath): string[] {
        return routePath.routePathLinks!
            .reduce<string[]>((flatlist, routePathLink) =>
            NodeHelper.getUniqueIds(
                    flatlist.concat(
                        routePathLink.endNodeId,
                        routePathLink.startNodeId,
                    ),
                ),
                              [],
            );
    }

    public static getUniqueIds(ids: string[]): string[] {
        const seen = {};
        return ids.filter(id =>
            seen.hasOwnProperty(id) ? false : (seen[id] = true),
        );
    }

    public static routePathHasStop(routePaths: IRoutePath[], nodeId: string) {
        return routePaths.some(routePath =>
            routePath.routePathLinks!.some(routePathLink =>
                (
                    routePathLink.endNodeId === nodeId
                    || routePathLink.startNodeId === nodeId
                ),
            ),
        );
    }
}
