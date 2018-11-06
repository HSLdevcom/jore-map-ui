import { IRoutePathLink, INode } from '~/models';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import NodeFactory from './nodeFactory';

export interface IRoutePathLinkResult {
    link: IRoutePathLink;
    nodes: INode[];
}

class RoutePathLinkFactory {
    public static createRoutePathLink =
    (externalRoutePathLink: IExternalRoutePathLink): IRoutePathLinkResult => {
        const nodes = [];
        if (externalRoutePathLink.startNode) {
            const node = NodeFactory.createNode(externalRoutePathLink.startNode);
            nodes.push(node);
        }
        if (externalRoutePathLink.endNode) {
            nodes.push(NodeFactory.createNode(externalRoutePathLink.endNode));
        }
        const coordinates = JSON.parse(
            externalRoutePathLink.geojson).coordinates;
        const positions = coordinates.map((coor: [number, number]) => [coor[1], coor[0]]);

        return {
            nodes,
            link: {
                positions,
                id: externalRoutePathLink.relid,
                startNodeId: externalRoutePathLink.lnkalkusolmu,
                endNodeId: externalRoutePathLink.lnkloppusolmu,
                orderNumber: externalRoutePathLink.reljarjnro,
                startNodeType: externalRoutePathLink.relpysakki,
                timeAlignmentStop: externalRoutePathLink.ajantaspys,
            },
        };
    }
}

export default RoutePathLinkFactory;
