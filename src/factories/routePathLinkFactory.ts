import * as L from 'leaflet';
import { IRoutePathLink } from '~/models';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import NumberIterator from '~/util/NumberIterator';
import IExternalLink from '~/models/externals/IExternalLink';
import Constants from '~/constants/constants';
import NodeFactory from './nodeFactory';

class RoutePathLinkFactory {
    private static getTemporaryRoutePathLinkId = () => {
        return `${Constants.NEW_OBJECT_TAG}-${NumberIterator.getNumber()}`;
    }

    public static mapExternalRoutePathLink =
    (externalRoutePathLink: IExternalRoutePathLink): IRoutePathLink => {
        const startNode = NodeFactory.mapExternalNode(externalRoutePathLink.solmuByLnkalkusolmu);
        const endNode = NodeFactory.mapExternalNode(externalRoutePathLink.solmuByLnkloppusolmu);
        const geoJson =
            JSON.parse(
                externalRoutePathLink.linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu.geojson,
            );

        return {
            startNode,
            endNode,
            geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
            id: String(externalRoutePathLink.relid),
            orderNumber: externalRoutePathLink.reljarjnro,
            startNodeType: externalRoutePathLink.relpysakki,
            isStartNodeTimeAlignmentStop: Boolean((externalRoutePathLink.ajantaspys === '1')),
            routeId: externalRoutePathLink.reitunnus,
            routePathDirection: externalRoutePathLink.suusuunta,
            routePathStartDate: new Date(externalRoutePathLink.suuvoimast),
            transitType: externalRoutePathLink.lnkverkko,
        };
    }

    public static createNewRoutePathLinkFromExternalLink =
    (link: IExternalLink, orderNumber: number): IRoutePathLink => {
        const startNode = NodeFactory.mapExternalNode(link.solmuByLnkalkusolmu);
        const geoJson = JSON.parse(
            link.geojson,
        );

        return {
            startNode,
            orderNumber,
            endNode: NodeFactory.mapExternalNode(link.solmuByLnkloppusolmu),
            geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
            isStartNodeTimeAlignmentStop: false,
            id: RoutePathLinkFactory.getTemporaryRoutePathLinkId(),
            startNodeType: startNode.type,
            transitType: link.lnkverkko,
        };
    }
}

export default RoutePathLinkFactory;
