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

interface ISearchRoute {
    id: string;
    name: string;
    isUsedByRoutePath: boolean;
}

export default IRoute;

export { IRoutePrimaryKey, ISearchRoute };
