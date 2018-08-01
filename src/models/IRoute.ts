import { IDirection } from '.';
import ILine from './ILine';

export default interface IRoute {
    routeName: String;
    routeNameSwedish: String;
    lineId: string;
    directions: IDirection[];
    line: ILine;
}
