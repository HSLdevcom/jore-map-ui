import { IRoutePath, ILine } from '.';

interface IRoutePrimaryKey {
    id: string;
}

export default interface IRoute extends IRoutePrimaryKey {
    routeName: string;
    routeNameSwedish: string;
    lineId: string;
    routePaths: IRoutePath[];
    line?: ILine;
}

export {
    IRoutePrimaryKey,
};
