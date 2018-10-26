import { IRoutePathLink, INode } from '~/models';
import NodeFactory from './nodeFactory';

export interface IRoutePathLinkResult {
    link: IRoutePathLink;
    nodes: INode[];
}

interface IExternalRoutePathLinkNode {
    linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu: {
        geojson: string,
    };
    lnkalkusolmu: string;
    lnkloppusolmu: string;
    lnkverkko: string;
    relid: string;
    reljarjnro: number;
    solmuByLnkalkusolmu: Object;
    solmuByLnkloppusolmu: Object;
}

class RoutePathLinkFactory {
    public static createRoutePathLink =
    (routePathLinkNode: IExternalRoutePathLinkNode): IRoutePathLinkResult => {
        const nodes = [];
        if (routePathLinkNode.solmuByLnkalkusolmu) {
            nodes.push(NodeFactory.createNode(routePathLinkNode.solmuByLnkalkusolmu));
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
            },
        };
    }
}

export default RoutePathLinkFactory;
