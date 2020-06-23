import { IRoutePath } from '.';

interface IRoutePrimaryKey {
    id: string;
}

interface IRoute extends IRoutePrimaryKey {
    routePaths: IRoutePath[];
    routeName: string;
    routeNameSw: string;
    lineId: string;
    modifiedBy?: string;
    modifiedOn?: Date;
}

interface ISearchLineRoute {
    id: string;
    name: string;
    isUsedByRoutePath: boolean;
    date?: Date;
}

export default IRoute;

export { IRoutePrimaryKey, ISearchLineRoute };
