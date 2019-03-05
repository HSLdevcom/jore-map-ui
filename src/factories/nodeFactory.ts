import * as L from 'leaflet';
import { INode } from '~/models';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import IExternalNode from '~/models/externals/IExternalNode';
import TransitTypeHelper from '~/util/transitTypeHelper';
import INodeBase from '~/models/baseModels/INodeBase';
import NodeStopFactory from './nodeStopFactory';

class NodeFactory {
    public static createNode = (externalNode: IExternalNode): INode => {
        // Use less accurate location if measured location is missing.
        const coordinates = L.GeoJSON.coordsToLatLng((JSON.parse(
            externalNode.geojson ? externalNode.geojson : externalNode.geojsonManual,
        )).coordinates);
        const coordinatesManual =
            L.GeoJSON.coordsToLatLng((JSON.parse(externalNode.geojsonManual)).coordinates);
        const coordinatesProjection =
            L.GeoJSON.coordsToLatLng((JSON.parse(externalNode.geojsonProjection)).coordinates);

        const nodeStop = externalNode.pysakkiBySoltunnus;
        let transitTypes: TransitType[] = [];
        if (externalNode.transittypes) {
            transitTypes = externalNode.transittypes.split(',').map(transitTypeCode =>
                TransitTypeHelper.convertTransitTypeCodeToTransitType(transitTypeCode));
        }

        return {
            ...NodeFactory.createNodeBase(externalNode),
            transitTypes,
            coordinates,
            coordinatesManual,
            coordinatesProjection,
            stop: nodeStop ? NodeStopFactory.createStop(nodeStop) : undefined,
            measurementDate: externalNode.mittpvm,
            modifiedOn: externalNode.solviimpvm,
            modifiedBy: externalNode.solkuka,
        };
    }

    public static createNodeBase = (externalNode: IExternalNode): INodeBase => {
        let shortId;

        if (externalNode.sollistunnus) {
            shortId = externalNode.solkirjain
            ? externalNode.solkirjain + externalNode.sollistunnus
            : externalNode.sollistunnus;
        }

        const type = getNodeType(externalNode.soltyyppi);
        // TODO: Change this when creating abstraction layers for reading from postgis
        if (type === NodeType.INVALID) {
            throw new Error(`Solmun (id: '${externalNode.soltunnus}') tyyppi on
            virheellinen: ${externalNode.soltyyppi}`);
        }

        return {
            shortId,
            type,
            id: externalNode.soltunnus,
        };
    }
}

const getNodeType = (type:any) => {
    switch (type) {
    case 'X':
        return NodeType.CROSSROAD;
    case 'P':
        return NodeType.STOP;
    case '-':
        return NodeType.MUNICIPALITY_BORDER;
    default:
        return NodeType.INVALID;
    }
};

export default NodeFactory;
