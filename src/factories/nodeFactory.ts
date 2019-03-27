import * as L from 'leaflet';
import { INode } from '~/models';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import { roundLatLng } from '~/util/geomHelper';
import IExternalNode from '~/models/externals/IExternalNode';
import INodeBase from '~/models/baseModels/INodeBase';
import NodeStopFactory from './nodeStopFactory';

class NodeFactory {
    public static createNode = (externalNode: IExternalNode): INode => {
        // Use less accurate location if measured location is missing.
        const coordinates = roundLatLng(
                L.GeoJSON.coordsToLatLng((JSON.parse(
                    externalNode.geojson ? externalNode.geojson : externalNode.geojsonManual,
                )).coordinates));
        const coordinatesManual = roundLatLng(
                L.GeoJSON.coordsToLatLng((JSON.parse(externalNode.geojsonManual)).coordinates));
        const coordinatesProjection = roundLatLng(
                L.GeoJSON.coordsToLatLng((JSON.parse(externalNode.geojsonProjection)).coordinates));
        const nodeStop = externalNode.pysakkiBySoltunnus;
        let transitTypes: TransitType[] = [];
        if (externalNode.transittypes) {
            transitTypes = externalNode.transittypes.split(',') as TransitType[];
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
        const type = getNodeType(externalNode.soltyyppi);
        // TODO: Change this when creating abstraction layers for reading from postgis
        if (type === NodeType.INVALID) {
            throw new Error(`Solmun (id: '${externalNode.soltunnus}') tyyppi on
            virheellinen: ${externalNode.soltyyppi}`);
        }

        return {
            type,
            shortIdLetter: externalNode.solkirjain,
            shortIdString: externalNode.sollistunnus,
            id: externalNode.soltunnus,
        };
    }

    public static createNewNode(coordinates: L.LatLng): INode {
        const newStop = NodeStopFactory.createNewStop();
        return {
            coordinates,
            id: '',
            stop: newStop,
            type: NodeType.STOP,
            transitTypes: [],
            coordinatesManual: coordinates,
            coordinatesProjection: coordinates,
            measurementDate: '',
            modifiedOn: '',
            modifiedBy: '',
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
