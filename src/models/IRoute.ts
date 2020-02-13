import { IRoutePath } from '.';

interface IRoutePrimaryKey {
    id: string;
}

export default interface IRoute extends IRoutePrimaryKey {
    routePaths: IRoutePath[];
    routeName: string;
    routeNameSw: string;
    lineId: string;
    modifiedBy?: string;
    modifiedOn?: Date;
}

export { IRoutePrimaryKey };
