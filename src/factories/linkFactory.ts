import * as L from 'leaflet';
import { ILink } from '~/models';
import IExternalLink from '~/models/externals/IExternalLink';
import TransitTypeHelper from '~/util/transitTypeHelper';
import municipality from '~/enums/municipality';
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
            length: externalLink.lnkpituus,
            measuredLength: externalLink.lnkmitpituus,
            municipality: municipality.Helsinki, // TODO, no hardcoded, externalLink.katkunta,
            streetName: externalLink.katnimi,
            streetNumber: externalLink.kaoosnro,
            modifiedBy: externalLink.lnkkuka,
            modifiedOn: new Date(externalLink.lnkviimpvm),
        };
    }
}

export default LinkFactory;
