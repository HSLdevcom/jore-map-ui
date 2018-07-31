import { IDirection } from '.';

export default interface IRoute {
    routeName: String;
    routeNameSwedish: String;
    lineId: string;
    directions?: IDirection[];
}
