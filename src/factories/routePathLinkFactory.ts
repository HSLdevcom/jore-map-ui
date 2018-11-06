import { IRoutePathLink, INode } from '~/models';
import NodeFactory from './nodeFactory';

export interface IRoutePathLinkResult {
    link: IRoutePathLink;
    nodes: INode[];
}

class RoutePathLinkFactory {
    public static createRoutePathLink = (routePathLinkNode: any): IRoutePathLinkResult => {
        const nodes = [];
        if (routePathLinkNode.solmuByLnkalkusolmu) {
            const node = NodeFactory.createNode(routePathLinkNode.solmuByLnkalkusolmu);
            nodes.push(node);
        }
        if (routePathLinkNode.solmuByLnkloppusolmu) {
            nodes.push(NodeFactory.createNode(routePathLinkNode.solmuByLnkloppusolmu));
        }
        const coordinates = JSON.parse(
            routePathLinkNode.linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu.geojson).coordinates;
        const positions = coordinates.map((coor: [number, number]) => [coor[1], coor[0]]);

        return {
            nodes,
            link: {
                positions,
                id: routePathLinkNode.relid,
                startNodeId: routePathLinkNode.lnkalkusolmu,
                endNodeId: routePathLinkNode.lnkloppusolmu,
                orderNumber: routePathLinkNode.reljarjnro,
                startNodeType: routePathLinkNode.relpysakki,
                timeAlignmentStop: routePathLinkNode.ajantaspys,
            },
        };
    }
}

export default RoutePathLinkFactory;
