import * as L from 'leaflet';
import { ILink, INode } from '~/models';
import IExternalLink from '~/models/externals/IExternalLink';
import { roundLatLngs } from '~/util/geomHelper';
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
            municipalityCode: externalLink.katkunta,
            streetName: externalLink.katnimi,
            modifiedBy: externalLink.lnkkuka,
            modifiedOn: externalLink.lnkviimpvm ? new Date(externalLink.lnkviimpvm) : undefined
        };
    };

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
            modifiedBy: '',
            modifiedOn: new Date()
        };
    };
}

export default LinkFactory;
