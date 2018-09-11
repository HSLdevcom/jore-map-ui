import RouteStore from '../stores/routeStore';
import RouteService from '../services/routeService';
import NodeStore from '../stores/nodeStore';
import { IRoutePath } from '../models';

export default class RoutesViewHelper {
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

    public static async fetchRequiredData(routeIds: string[]) {
        const currentRoutes = RouteStore.routes;
        const currentRouteIds = currentRoutes
            .map(route => route.routeId);
        const missingRouteIds = routeIds
            .filter(routeId => currentRouteIds.indexOf(routeId) < 0);
        const routeIdsToRemove = currentRouteIds
            .filter(routeId => routeIds.indexOf(routeId) < 0);

        routeIdsToRemove.forEach((removedRoute) => {
            RouteStore.removeFromRoutes(removedRoute);
        });

        const routeServiceResults = await RouteService.fetchMultipleRoutes(missingRouteIds);

        routeServiceResults.routes.forEach((route) => {
            RouteStore.addToRoutes(route);
        });

        const updatedRoutesList = currentRoutes
            .filter(route => routeIdsToRemove.indexOf(route.routeId) < 0)
            .concat(routeServiceResults.routes);

        const currentNodes = NodeStore.nodes;
        const currentNodeIds = currentNodes.map(node => node.id);
        const nodeIdsToRemove = currentNodeIds
            .filter(nodeId =>
                !updatedRoutesList.some(route =>
                    !RoutesViewHelper.routePathHasStop(route.routePaths, nodeId),
                ),
            );

        nodeIdsToRemove.forEach(removedNode =>
            NodeStore.removeFromNodes(removedNode),
        );

        const missingNodes = routeServiceResults.nodes
            .filter(nodeId => !currentNodeIds.some(cNodeId => cNodeId === nodeId.id));

        missingNodes.forEach(node =>
            NodeStore.addToNodes(node),
        );
    }
}
