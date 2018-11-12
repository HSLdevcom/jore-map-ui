import { IRoutePathLink } from '~/models';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import NodeFactory from './nodeFactory';

class RoutePathLinkFactory {
    public static createRoutePathLink =
    (externalRoutePathLink: IExternalRoutePathLink): IRoutePathLink => {
        let startNode = null;
        let endNode = null;
        if (externalRoutePathLink.startNode) {
            startNode = NodeFactory.createNode(externalRoutePathLink.startNode);
        }
        if (externalRoutePathLink.endNode) {
            endNode = NodeFactory.createNode(externalRoutePathLink.endNode);
        }
        const coordinates = JSON.parse(
            externalRoutePathLink.geojson).coordinates;
        const positions = coordinates.map((coor: [number, number]) => [coor[1], coor[0]]);

        return {
            positions,
            startNode,
            endNode,
            id: externalRoutePathLink.relid,
            orderNumber: externalRoutePathLink.reljarjnro,
            startNodeType: externalRoutePathLink.relpysakki,
            isStartNodeTimeAlignmentStop: !!externalRoutePathLink.ajantaspys,
        };
    }
}

export default RoutePathLinkFactory;
