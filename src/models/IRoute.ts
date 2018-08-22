import { IRoutePath } from '.';
import ILine from './ILine';

export default interface IRoute {
    routeName: string;
    routeNameSwedish: string;
    lineId: string;
    routeId: string;
    routePaths: IRoutePath[];
    line: ILine;
}
