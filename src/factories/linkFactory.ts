import { ILink } from '~/models';
import IExternalLink from '~/models/externals/IExternalLink';
import TransitTypeHelper from '~/util/transitTypeHelper';
import NodeFactory from './nodeFactory';

class LinkFactory {
    private static getPositions = (geojson: string) => {
        const coordinates = JSON.parse(geojson).coordinates;
        return coordinates.map((coor: [number, number]) => [coor[1], coor[0]]);
    }

    public static createLinkFromExternalLink =
    (externalLink: IExternalLink): ILink => {
        const transitType = TransitTypeHelper
        .convertTransitTypeCodeToTransitType(externalLink.lnkverkko);

        return {
            transitType,
            startNode: NodeFactory.createNode(externalLink.solmuByLnkalkusolmu),
            endNode: NodeFactory.createNode(externalLink.solmuByLnkloppusolmu),
            positions: LinkFactory.getPositions(externalLink.geojson),
        };
    }
}

export default LinkFactory;
