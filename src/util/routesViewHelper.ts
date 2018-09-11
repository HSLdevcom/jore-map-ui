import RouteStore from '../stores/routeStore';
import RouteService from '../services/routeService';
import NodeStore from '../stores/nodeStore';
import { IRoutePath, IRoute } from '../models';

export default class RoutesViewHelper {
    public static getNodeIdsUsedByRoutes(routes: IRoute[]): number[] {
        return routes
            .reduce<number[]>((flatlist, route) =>
                RoutesViewHelper.getUniqueNumbers(
                    flatlist.concat(
                        RoutesViewHelper.getNodeIdsUsedByRoutePaths(route.routePaths),
                    ),
                ),
                              [],
            );
    }

    public static getNodeIdsUsedByRoutePaths(routePaths: IRoutePath[]): number[] {
        return routePaths
            .reduce<number[]>((flatlist, routePath) =>
                RoutesViewHelper.getUniqueNumbers(
                    flatlist.concat(
                        RoutesViewHelper.getNodeIdsUsedByRoutePath(routePath),
                    ),
                ),
                              [],
            );
    }

    public static getNodeIdsUsedByRoutePath(routePath: IRoutePath): number[] {
        return routePath.routePathLinks
            .reduce<number[]>((flatlist, routePathLink) =>
                RoutesViewHelper.getUniqueNumbers(
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

    public static getRouteIdsMissingFromStore(routeIds: string[]) {
        const currentRouteIds = RouteStore.routes
            .map(route => route.routeId);
        return routeIds
            .filter(routeId => currentRouteIds.indexOf(routeId) < 0);
    }

    public static removeUnusedNodes() {
        console.log(`We have ${NodeStore.nodes.length} nodes`);
        const requiredStopIds = RoutesViewHelper.getNodeIdsUsedByRoutes(RouteStore.routes);
        console.log(`We need ${requiredStopIds.length} nodes`);

        const nodeIdsToRemove = NodeStore.nodes
            .map(node => node.id)
            .filter(nodeId => !requiredStopIds.some(rStop => rStop === nodeId));

        console.log(`We remove ${nodeIdsToRemove.length} nodes`);

        NodeStore.removeFromNodes(nodeIdsToRemove);

        console.log(`We get ${NodeStore.nodes.length} nodes`);
    }

    public static async addRequiredDataForRoutes(routeIds: string[]) {
        const missingRouteIds = RoutesViewHelper.getRouteIdsMissingFromStore(routeIds);
        const routeServiceResults = await RouteService.fetchMultipleRoutes(missingRouteIds);
        RouteStore.addToRoutes(routeServiceResults.routes);

        const currentNodeIds = NodeStore.nodes.map(node => node.id);

        const missingNodes = routeServiceResults.nodes
            .filter(nodeId => !currentNodeIds.some(cNodeId => cNodeId === nodeId.id));

        NodeStore.addToNodes(missingNodes);
    }

    public static removeRoute(routeId: string) {
        RouteStore.removeFromRoutes(routeId);
        RoutesViewHelper.removeUnusedNodes();
    }
}
