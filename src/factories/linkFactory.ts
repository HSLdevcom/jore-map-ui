import * as L from 'leaflet';
import { ILink, INode } from '~/models';
import IExternalLink from '~/models/externals/IExternalLink';
import NodeFactory from './nodeFactory';

class LinkFactory {
    public static mapExternalLink = (externalLink: IExternalLink): ILink => {
        const geoJson = JSON.parse(externalLink.geojson);

        return {
            startNode: NodeFactory.mapExternalNode(externalLink.solmuByLnkalkusolmu),
            endNode: NodeFactory.mapExternalNode(externalLink.solmuByLnkloppusolmu),
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

    public static createNewLink = (startNode: INode, endNode: INode): ILink => {
        const geometry = [startNode.coordinates, endNode.coordinates];
        return {
            geometry,
            startNode,
            endNode,
            length: 0,
            measuredLength: 0,
            municipalityCode: '',
            streetName: '',
            streetNumber: '',
            modifiedBy: '',
            modifiedOn: new Date,
            direction: '0',
            osNumber: '',
        };
    }
}

export default LinkFactory;
