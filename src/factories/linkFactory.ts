import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import { ILink, INode } from '~/models';
import { ILinkMapHighlight } from '~/models/ILink';
import IExternalLink, { IExternalNetworkSelectLink } from '~/models/externals/IExternalLink';
import { roundLatLngs } from '~/utils/geomUtils';
import NodeFactory from './nodeFactory';

class LinkFactory {
    public static mapExternalLink = (externalLink: IExternalLink): ILink => {
        const geojson = JSON.parse(externalLink.geojson);
        const latLngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(geojson.coordinates);

        return {
            startNode: NodeFactory.mapExternalNode(externalLink.solmuByLnkalkusolmu),
            endNode: NodeFactory.mapExternalNode(externalLink.solmuByLnkloppusolmu),
            geometry: roundLatLngs(latLngs),
            transitType: externalLink.lnkverkko,
            length: externalLink.lnkpituus,
            measuredLength: externalLink.lnkmitpituus,
            speed: externalLink.speed ? Math.round(externalLink.speed) : 0,
            dateRanges: externalLink.dateRanges,
            modifiedBy: externalLink.lnkkuka,
            modifiedOn: externalLink.lnkviimpvm ? new Date(externalLink.lnkviimpvm) : undefined,
        };
    };

    public static createLinkMapHighlight = (
        externalLink: IExternalNetworkSelectLink
    ): ILinkMapHighlight => {
        const geojson = JSON.parse(externalLink.geojson);
        const latLngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(geojson.coordinates);
        return {
            transitType: externalLink.lnkverkko,
            geometry: roundLatLngs(latLngs),
            startNodeId: externalLink.lnkalkusolmu!,
            endNodeId: externalLink.lnkloppusolmu!,
            dateRanges: externalLink.dateRanges!,
            startNodeTransitTypes: externalLink.startNodeTransitTypes
                ? (externalLink.startNodeTransitTypes.split(',') as TransitType[])
                : [],
            startNodeType: externalLink.startNodeType,
            endNodeTransitTypes: externalLink.endNodeTransitTypes
                ? (externalLink.endNodeTransitTypes.split(',') as TransitType[])
                : [],
            endNodeType: externalLink.endNodeType,
        };
    };

    public static createNewLink = (startNode: INode, endNode: INode): ILink => {
        const geometry = [startNode.coordinatesProjection, endNode.coordinatesProjection];
        return {
            geometry,
            startNode,
            endNode,
            length: 0,
            measuredLength: 0,
            speed: 0,
            dateRanges: '',
            modifiedBy: '',
            modifiedOn: new Date(),
        };
    };
}

export default LinkFactory;
