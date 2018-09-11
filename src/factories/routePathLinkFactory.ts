import { IRoutePathLink, INode } from '../models';
import NodeFactory from './nodeFactory';

export interface IRoutePathLinkResult {
    link: IRoutePathLink;
    nodes: INode[];
}

class RoutePathLinkFactory {
    public static createRoutePathLink = (node: any): IRoutePathLinkResult => {
        const nodes = [];
        if (node.solmuByLnkalkusolmu) {
            nodes.push(NodeFactory.createNode(node.solmuByLnkalkusolmu));
        }
        if (node.solmuByLnkloppusolmu) {
            nodes.push(NodeFactory.createNode(node.solmuByLnkloppusolmu));
        }

        return {
            nodes,
            link: {
                startNode: node.lnkalkusolmu,
                endNode: node.lnkloppusolmu,
                orderNumber: node.reljarjnro,
            },
        };
    }
}

export default RoutePathLinkFactory;
