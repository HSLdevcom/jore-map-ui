import { ILine, IRoute, IRoutePath } from '~/models';
import IExternalRoute from '~/models/externals/IExternalRoute.ts';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath.ts';
import RoutePathFactory from './routePathFactory';

class RouteFactory {
    public static mapExternalRoute = (externalRoute: IExternalRoute, line?: ILine): IRoute => {
        const routePaths: IRoutePath[] = externalRoute.reitinsuuntasByReitunnus.nodes.map(
            (routePath: IExternalRoutePath) => {
                return RoutePathFactory.mapExternalRoutePath(routePath);
            }
        );

        return {
            line,
            routePaths: routePaths.sort((a, b) => b.endTime.getTime() - a.endTime.getTime()),
            routeName: externalRoute.reinimi,
            routeNameShort: externalRoute.reinimilyh,
            routeNameSw: externalRoute.reinimir,
            routeNameShortSw: externalRoute.reinimilyhr,
            lineId: externalRoute.lintunnus,
            id: externalRoute.reitunnus,
            modifiedBy: externalRoute.reikuka,
            modifiedOn: externalRoute.reiviimpvm ? new Date(externalRoute.reiviimpvm) : undefined
        };
    };

    public static createNewRoute = (lineId: string): IRoute => {
        return {
            lineId,
            id: '',
            routePaths: [],
            routeName: '',
            routeNameShort: '',
            routeNameSw: '',
            routeNameShortSw: '',
            modifiedBy: '',
            modifiedOn: new Date()
        };
    };
}

export default RouteFactory;
