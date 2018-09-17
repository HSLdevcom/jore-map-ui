import { IRoutePathLink, INode } from '../models';
import NodeFactory from './nodeFactory';

export interface IRoutePathLinkResult {
    link: IRoutePathLink;
    nodes: INode[];
}

class RoutePathLinkFactory {
    public static createRoutePathLink = (routePathLinkNode: any): IRoutePathLinkResult => {
        const nodes = [];
        if (routePathLinkNode.solmuByLnkalkusolmu) {
            nodes.push(NodeFactory.createNode(routePathLinkNode.solmuByLnkalkusolmu));
        }
        if (routePathLinkNode.solmuByLnkloppusolmu) {
            nodes.push(NodeFactory.createNode(routePathLinkNode.solmuByLnkloppusolmu));
        }

        return {
            nodes,
            link: {
                startNode: routePathLinkNode.lnkalkusolmu,
                endNode: routePathLinkNode.lnkloppusolmu,
                orderNumber: routePathLinkNode.reljarjnro,
            },
        };
    }
}

export default RoutePathLinkFactory;
