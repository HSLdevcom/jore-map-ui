import IRoutePathLink from '../models/IRoutePathLink';

class RoutePathLinkFactory {
    public static createRoutePathLink = (node: any): IRoutePathLink => {
        return <IRoutePathLink>{
            id: node.relid,
            startNode: node.lnkalkusolmu,
            endNode: node.lnkloppusolmu,
            orderNumber: node.reljarjnro,
            network: node.lnkverkko,
        };
    }
}

export default RoutePathLinkFactory;
