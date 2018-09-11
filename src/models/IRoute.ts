import { IRoutePath, ILine } from '.';

export default interface IRoute {
    routeName: string;
    routeNameSwedish: string;
    lineId: string;
    routeId: string;
    routePaths: IRoutePath[];
    line?: ILine;
}
