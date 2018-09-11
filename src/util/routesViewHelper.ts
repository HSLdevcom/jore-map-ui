import RouteStore from '../stores/routeStore';
import RouteService from '../services/routeService';

export default class RoutesViewHelper {
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

        console.log(updatedRoutesList);
    }
}
