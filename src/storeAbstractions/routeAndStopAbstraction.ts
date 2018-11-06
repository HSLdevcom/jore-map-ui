import routeStore from '~/stores/routeStore';
import RouteService from '~/services/routeService';

export default class RouteAndStopAbstraction {

    // TODO: remove this class, put the code to components or at store
    public static async addRequiredDataForRoutes(routeIds: string[]) {
        // TODO:
        // missingRouteIds = routeStore.getRoutes find missing ids
        const missingRouteIds = routeIds;

        const routes = await RouteService.fetchMultipleRoutes(missingRouteIds);
        if (routes) {
            routeStore.addToRoutes(routes);
        }
    }

    public static removeRoute(routeId: string) {
        routeStore.removeFromRoutes(routeId);
    }
}
