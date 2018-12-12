import { IRoute, IRoutePath, ILine } from '~/models';
import IExternalRoute from '~/models/externals/IExternalRoute.ts';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath.ts';
import RoutePathFactory from './routePathFactory';

class RouteFactory {
    public static createRoute = (externalRoute: IExternalRoute, line?: ILine): IRoute => {
        const routePaths:IRoutePath[]
            = externalRoute.reitinsuuntasByReitunnus.nodes
                .map((routePath: IExternalRoutePath) => {
                    return RoutePathFactory.createRoutePath(
                        externalRoute.reitunnus, routePath);
                });

        const route = {
            line,
            routePaths: routePaths
                .sort((a, b) => b.endTime.getTime() - a.endTime.getTime()),
            routeName: externalRoute.reinimi,
            routeNameSwedish: externalRoute.reinimir,
            lineId: externalRoute.lintunnus,
            id: externalRoute.reitunnus,
        };

        return route;
    }
}

export default RouteFactory;
