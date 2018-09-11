import IRoutePathLink from '../models/IRoutePathLink';

class RoutePathLinkFactory {
    public static createRoutePathLink = (node: any): IRoutePathLink => {
        return {
            startNode: node.lnkalkusolmu,
            endNode: node.lnkloppusolmu,
            orderNumber: node.reljarjnro,
        };
    }
}

export default RoutePathLinkFactory;
