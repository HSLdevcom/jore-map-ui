import { IRoutePath, ILine } from '.';

interface IRoutePrimaryKey {
    id: string;
}

export default interface IRoute extends IRoutePrimaryKey {
    routePaths: IRoutePath[];
    routeName: string;
    routeNameShort: string;
    routeNameSw: string;
    routeNameShortSw: string;
    lineId: string;
    line?: ILine;
    modifiedBy?: string;
    modifiedOn?: Date;
}

export { IRoutePrimaryKey };
