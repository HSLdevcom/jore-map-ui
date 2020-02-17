import { IRoute, IRoutePath } from '~/models';
import IExternalRoute from '~/models/externals/IExternalRoute.ts';

class RouteFactory {
    public static mapExternalRoute = (
        externalRoute: IExternalRoute,
        routePaths?: IRoutePath[]
    ): IRoute => {
        return {
            routePaths: routePaths ? routePaths : [],
            routeName: externalRoute.reinimi,
            routeNameSw: externalRoute.reinimir,
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
            routeNameSw: '',
            modifiedBy: '',
            modifiedOn: new Date()
        };
    };
}

export default RouteFactory;
