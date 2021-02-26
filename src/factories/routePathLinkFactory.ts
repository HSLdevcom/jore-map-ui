import * as L from 'leaflet';
import constants from '~/constants/constants';
import StartNodeType from '~/enums/startNodeType';
import NumberIterator from '~/helpers/NumberIterator';
import IRoutePathLink from '~/models/IRoutePathLink';
import IExternalLink from '~/models/externals/IExternalLink';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import NodeFactory from './nodeFactory';

const numberIterator = new NumberIterator();

class RoutePathLinkFactory {
    private static getTemporaryRoutePathLinkId = () => {
        return `${constants.NEW_OBJECT_TAG}${numberIterator.getNumber()}`;
    };

    public static mapExternalRoutePathLink = (
        externalRoutePathLink: IExternalRoutePathLink
    ): IRoutePathLink => {
        const startNode = NodeFactory.mapExternalNode(externalRoutePathLink.solmuByLnkalkusolmu);
        const endNode = NodeFactory.mapExternalNode(externalRoutePathLink.solmuByLnkloppusolmu);
        const geoJson = JSON.parse(
            externalRoutePathLink.linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu.geojson
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
            startNodeType: externalRoutePathLink.relpysakki as StartNodeType,
            isStartNodeHastusStop: externalRoutePathLink.paikka === '1',
            isStartNodeUsingBookSchedule: externalRoutePathLink.kirjaan === '1',
            startNodeBookScheduleColumnNumber: externalRoutePathLink.kirjasarake
                ? externalRoutePathLink.kirjasarake
                : undefined,
            transitType: externalRoutePathLink.lnkverkko,
            modifiedBy: externalRoutePathLink.relkuka,
            modifiedOn: externalRoutePathLink.relviimpvm
                ? new Date(externalRoutePathLink.relviimpvm)
                : undefined,
        };
    };

    /**
     * @param {IExternalLink} link - link to use in convert
     * @param {Number} orderNumber - routePathLink orderNumber
     * @return {IRoutePathLink} routePathLink with hard coded default values
     */
    public static mapExternalLink = (link: IExternalLink, orderNumber: number): IRoutePathLink => {
        const startNode = NodeFactory.mapExternalNode(link.solmuByLnkalkusolmu);
        const geoJson = JSON.parse(link.geojson);
        let startNodeType: StartNodeType;
        switch (startNode.type) {
            case 'P':
                startNodeType = StartNodeType.STOP;
                break;
            case 'X':
                startNodeType = StartNodeType.CROSSROAD;
                break;
            case '-':
                startNodeType = StartNodeType.MUNICIPALITY_BORDER;
                break;
            default:
                throw `startNode.type not supported: ${startNode.type}`;
        }
        return {
            startNode,
            orderNumber,
            startNodeType,
            endNode: NodeFactory.mapExternalNode(link.solmuByLnkloppusolmu),
            geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
            startNodeUsage: '0',
            startNodeTimeAlignmentStop: '0',
            isStartNodeHastusStop: false,
            isStartNodeUsingBookSchedule: false,
            startNodeBookScheduleColumnNumber: undefined,
            id: RoutePathLinkFactory.getTemporaryRoutePathLinkId(),
            transitType: link.lnkverkko,
            modifiedBy: '',
            modifiedOn: new Date(),
        };
    };
}

export default RoutePathLinkFactory;
