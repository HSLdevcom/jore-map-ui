import * as L from 'leaflet';
import { IRoutePathLink } from '~/models';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import NumberIterator from '~/util/NumberIterator';
import IExternalLink from '~/models/externals/IExternalLink';
import { NEW_OBJECT_TAG } from '~/constants';
import NodeFactory from './nodeFactory';

class RoutePathLinkFactory {
    private static getTemporaryRoutePathLinkId = () => {
        return `${NEW_OBJECT_TAG}-${NumberIterator.getNumber()}`;
    }

    public static createRoutePathLink =
    (externalRoutePathLink: IExternalRoutePathLink): IRoutePathLink => {
        const startNode = NodeFactory.createNode(externalRoutePathLink.solmuByLnkalkusolmu);
        const endNode = NodeFactory.createNode(externalRoutePathLink.solmuByLnkloppusolmu);
        const geoJson =
            JSON.parse(
                externalRoutePathLink.linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu.geojson,
            );

        return {
            startNode,
            endNode,
            geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
            id: externalRoutePathLink.relid,
            orderNumber: externalRoutePathLink.reljarjnro,
            startNodeType: externalRoutePathLink.relpysakki,
            isStartNodeTimeAlignmentStop: Boolean((externalRoutePathLink.ajantaspys === '1')),
            routeId: externalRoutePathLink.reitunnus,
            routePathDirection: externalRoutePathLink.suusuunta,
            routePathStartDate: new Date(externalRoutePathLink.suuvoimast),
        };
    }

    public static createNewRoutePathLinkFromExternalLink =
    (link: IExternalLink, orderNumber: number): IRoutePathLink => {
        const startNode = NodeFactory.createNode(link.solmuByLnkalkusolmu);
        const geoJson = JSON.parse(
            link.geojson,
        );

        return {
            startNode,
            orderNumber,
            endNode: NodeFactory.createNode(link.solmuByLnkloppusolmu),
            geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
            isStartNodeTimeAlignmentStop: false,
            id: RoutePathLinkFactory.getTemporaryRoutePathLinkId(),
            startNodeType: startNode.type,
        };
    }
}

export default RoutePathLinkFactory;
