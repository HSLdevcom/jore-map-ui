import { IRoutePathLink } from '~/models';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import NumberIterator from '~/util/NumberIterator';
import IExternalLink from '~/models/externals/IExternalLink';
import { NEW_OBJECT_TAG } from '~/constants';
import NodeFactory from './nodeFactory';

class RoutePathLinkFactory {
    private static getPositions(geojson: string) {
        const coordinates = JSON.parse(geojson).coordinates;
        return coordinates.map((coor: [number, number]) => [coor[1], coor[0]]);
    }

    private static getTemporaryRoutePathLinkId() {
        return `${NEW_OBJECT_TAG}-${NumberIterator.getNumber()}`;
    }

    public static createRoutePathLink =
    (externalRoutePathLink: IExternalRoutePathLink): IRoutePathLink => {
        const startNode = NodeFactory.createNode(externalRoutePathLink.solmuByLnkalkusolmu);
        const endNode = NodeFactory.createNode(externalRoutePathLink.solmuByLnkloppusolmu);

        return {
            startNode,
            endNode,
            positions: RoutePathLinkFactory.getPositions(
                externalRoutePathLink.linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu.geojson),
            id: externalRoutePathLink.relid,
            orderNumber: externalRoutePathLink.reljarjnro,
            startNodeType: externalRoutePathLink.relpysakki,
            isStartNodeTimeAlignmentStop: !!externalRoutePathLink.ajantaspys,
            routeId: externalRoutePathLink.reitunnus,
            routePathDirection: externalRoutePathLink.suusuunta,
            routePathStartDate: new Date(externalRoutePathLink.suuvoimast),
        };
    }

    public static createNewRoutePathLinkFromExternalLink =
    (link: IExternalLink): IRoutePathLink => {
        const startNode = NodeFactory.createNode(link.solmuByLnkalkusolmu);
        return {
            startNode,
            endNode: NodeFactory.createNode(link.solmuByLnkloppusolmu),
            positions: RoutePathLinkFactory.getPositions(link.geojson),
            isStartNodeTimeAlignmentStop: false,
            id: RoutePathLinkFactory.getTemporaryRoutePathLinkId(),
            orderNumber: 0,
            startNodeType: startNode.type,
        };
    }
}

export default RoutePathLinkFactory;
