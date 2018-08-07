import { IRoute, IRoutePath, ILine } from '../models';
import RoutePathFactory from './routePathFactory';

class RouteFactory {
    // reitti to IRoute
    public static createRoute = (reitti: any, line?: ILine): IRoute => {
        const routePaths:IRoutePath[]
            = reitti.reitinsuuntasByReitunnus.edges
                .map((routePath: any) => RoutePathFactory.createRoutePath(routePath.node));

        return <IRoute>{
            routePaths,
            line,
            routeName: reitti.reinimi,
            routeNameSwedish: reitti.reinimir,
            lineId: reitti.lintunnus,
        };
    }
}

export default RouteFactory;
