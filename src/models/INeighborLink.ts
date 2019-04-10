import { IRoutePathLink } from '.';
import IRoutePath from './IRoutePath';

interface INeighborLink {
    nodeUsageRoutePaths: IRoutePath[];
    routePathLink: IRoutePathLink;
}

export default INeighborLink;
