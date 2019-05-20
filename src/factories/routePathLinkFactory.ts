import * as L from 'leaflet';
import { IRoutePathLink, IRoutePath } from '~/models';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import NumberIterator from '~/util/NumberIterator';
import IExternalLink from '~/models/externals/IExternalLink';
import Constants from '~/constants/constants';
import NodeFactory from './nodeFactory';

class RoutePathLinkFactory {
    private static getTemporaryRoutePathLinkId = () => {
        return `${Constants.NEW_OBJECT_TAG}-${NumberIterator.getNumber()}`;
    };

    public static mapExternalRoutePathLink = (
        externalRoutePathLink: IExternalRoutePathLink
    ): IRoutePathLink => {
        const startNode = NodeFactory.mapExternalNode(
            externalRoutePathLink.solmuByLnkalkusolmu
        );
        const endNode = NodeFactory.mapExternalNode(
            externalRoutePathLink.solmuByLnkloppusolmu
        );
        const geoJson = JSON.parse(
            externalRoutePathLink
                .linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu.geojson
        );

        return {
            startNode,
            endNode,
            geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
            id: String(externalRoutePathLink.relid),
            orderNumber: externalRoutePathLink.reljarjnro,
            startNodeUsage: externalRoutePathLink.relohaikpys,
            startNodeTimeAlignmentStop: externalRoutePathLink.ajantaspys
                ? externalRoutePathLink.ajantaspys
                : '0',
            startNodeType: externalRoutePathLink.relpysakki,
            isStartNodeHastusStop: externalRoutePathLink.paikka === '1',
            isStartNodeUsingBookSchedule: externalRoutePathLink.kirjaan === '1',
            startNodeBookScheduleColumnNumber:
                externalRoutePathLink.kirjasarake,
            routeId: externalRoutePathLink.reitunnus,
            routePathDirection: externalRoutePathLink.suusuunta,
            routePathStartDate: new Date(externalRoutePathLink.suuvoimast),
            transitType: externalRoutePathLink.lnkverkko,
            modifiedBy: externalRoutePathLink.relkuka,
            modifiedOn: new Date(externalRoutePathLink.relviimpvm)
        };
    };

    /**
     * @param {IExternalLink} link - link to use in convert
     * @param {IRoutePath} routePath - routePath to use in convert
     * @param {Number} orderNumber - routePathLink orderNumber
     * @return {IRoutePathLink} routePathLink with hard coded default values
     */
    public static mapExternalRoutePathLinkFromExternalLink = (
        link: IExternalLink,
        routePath: IRoutePath,
        orderNumber: number
    ): IRoutePathLink => {
        const startNode = NodeFactory.mapExternalNode(link.solmuByLnkalkusolmu);
        const geoJson = JSON.parse(link.geojson);

        return {
            startNode,
            orderNumber,
            routeId: routePath.routeId,
            routePathDirection: routePath.direction,
            routePathStartDate: routePath.startTime,
            endNode: NodeFactory.mapExternalNode(link.solmuByLnkloppusolmu),
            geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
            startNodeUsage: '0',
            startNodeType: startNode.type,
            startNodeTimeAlignmentStop: '0',
            isStartNodeHastusStop: false,
            isStartNodeUsingBookSchedule: false,
            startNodeBookScheduleColumnNumber: null,
            id: RoutePathLinkFactory.getTemporaryRoutePathLinkId(),
            transitType: link.lnkverkko,
            modifiedBy: '',
            modifiedOn: new Date()
        };
    };
}

export default RoutePathLinkFactory;
