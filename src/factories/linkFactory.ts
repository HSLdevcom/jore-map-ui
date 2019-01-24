import * as L from 'leaflet';
import { ILink } from '~/models';
import IExternalLink from '~/models/externals/IExternalLink';
import TransitTypeHelper from '~/util/transitTypeHelper';
import NodeFactory from './nodeFactory';

class LinkFactory {
    public static createLinkFromExternalLink =
    (externalLink: IExternalLink): ILink => {
        const transitType = TransitTypeHelper
            .convertTransitTypeCodeToTransitType(externalLink.lnkverkko);
        const geoJson = JSON.parse(externalLink.geojson);

        return {
            transitType,
            startNode: NodeFactory.createNode(externalLink.solmuByLnkalkusolmu),
            endNode: NodeFactory.createNode(externalLink.solmuByLnkloppusolmu),
            geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
        };
    }
}

export default LinkFactory;
