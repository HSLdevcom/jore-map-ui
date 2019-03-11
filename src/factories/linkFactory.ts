import * as L from 'leaflet';
import { ILink } from '~/models';
import IExternalLink from '~/models/externals/IExternalLink';
import NodeFactory from './nodeFactory';

class LinkFactory {
    public static createLinkFromExternalLink =
    (externalLink: IExternalLink): ILink => {
        const geoJson = JSON.parse(externalLink.geojson);

        return {
            startNode: NodeFactory.createNode(externalLink.solmuByLnkalkusolmu),
            endNode: NodeFactory.createNode(externalLink.solmuByLnkloppusolmu),
            geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
            transitType: externalLink.lnkverkko,
            length: externalLink.lnkpituus,
            measuredLength: externalLink.lnkmitpituus,
            municipalityCode: externalLink.katkunta,
            streetName: externalLink.katnimi,
            streetNumber: externalLink.kaoosnro,
            modifiedBy: externalLink.lnkkuka,
            modifiedOn: new Date(externalLink.lnkviimpvm),
            direction: externalLink.lnksuunta,
            osNumber: externalLink.lnkosnro,
        };
    }
}

export default LinkFactory;
