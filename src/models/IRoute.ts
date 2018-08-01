import { IDirection } from '.';
import ILine from './ILine';

export default interface IRoute {
    routeName: string;
    routeNameSwedish: string;
    lineId: string;
    directions: IDirection[];
    line: ILine;
}
