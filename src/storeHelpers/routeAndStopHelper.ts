import RouteStore from '../stores/routeStore';
import NodeStore from '../stores/nodeStore';
import NodeHelper from '../util/nodeHelper';
import RouteService from '../services/routeService';

export default class RouteAndStopHelper {
    private static getRouteIdsMissingFromStore(routeIds: string[]) {
        const currentRouteIds = RouteStore.routes
            .map(route => route.routeId);
        return routeIds
            .filter(routeId => currentRouteIds.indexOf(routeId) < 0);
    }

    private static removeUnusedNodes() {
        const requiredStopIds = NodeHelper.getNodeIdsUsedByRoutes(RouteStore.routes);

        const nodeIdsToRemove = NodeStore.nodes
            .map(node => node.id)
            .filter(nodeId => !requiredStopIds.some(rStop => rStop === nodeId));

        NodeStore.removeFromNodes(nodeIdsToRemove);
    }

    public static async addRequiredDataForRoutes(routeIds: string[]) {
        const missingRouteIds = RouteAndStopHelper.getRouteIdsMissingFromStore(routeIds);
        const routeServiceResults = await RouteService.fetchMultipleRoutes(missingRouteIds);
        RouteStore.addToRoutes(routeServiceResults.routes);

        const currentNodeIds = NodeStore.nodes.map(node => node.id);

        const missingNodes = routeServiceResults.nodes
            .filter(nodeId => !currentNodeIds.some(cNodeId => cNodeId === nodeId.id));

        NodeStore.addToNodes(missingNodes);
    }

    public static removeRoute(routeId: string) {
        RouteStore.removeFromRoutes(routeId);
        RouteAndStopHelper.removeUnusedNodes();
    }
}
