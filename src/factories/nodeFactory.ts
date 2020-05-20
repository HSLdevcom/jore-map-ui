import * as L from 'leaflet';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import NumberIterator from '~/helpers/NumberIterator';
import { INode } from '~/models';
import { INodeBase, INodeMapHighlight } from '~/models/INode';
import IExternalNode from '~/models/externals/IExternalNode';
import { roundLatLng } from '~/utils/geomUtils';
import NodeStopFactory from './nodeStopFactory';

const numberIterator = new NumberIterator();

class NodeFactory {
    public static mapExternalNode = (externalNode: IExternalNode): INode => {
        const coordinates = _getLatLng(
            externalNode.geojson ? externalNode.geojson : externalNode.geojsonManual
        );
        const coordinatesProjection = _getLatLng(externalNode.geojsonProjection);
        const nodeStop = externalNode.pysakkiBySoltunnus;

        return {
            ...NodeFactory.createNodeBase(externalNode),
            coordinates,
            coordinatesProjection,
            internalId: `node-${numberIterator.getNumber()}`,
            stop: nodeStop ? NodeStopFactory.mapExternalStop(nodeStop) : null,
            measurementDate: externalNode.mittpvm ? new Date(externalNode.mittpvm) : undefined,
            measurementType: externalNode.solotapa,
            modifiedOn: externalNode.solviimpvm ? new Date(externalNode.solviimpvm) : undefined,
            modifiedBy: externalNode.solkuka,
        };
    };

    public static createNodeBase = (externalNode: IExternalNode): INodeBase => {
        const type = _getNodeType(externalNode.soltyyppi, externalNode.soltunnus);
        return {
            type,
            shortIdLetter: externalNode.solkirjain,
            shortIdString: externalNode.sollistunnus,
            id: externalNode.soltunnus,
            transitTypes: externalNode.transitTypes
                ? (externalNode.transitTypes.split(',') as TransitType[])
                : [],
        };
    };

    public static createNodeMapHighlight = (externalNode: IExternalNode): INodeMapHighlight => {
        const coordinates = _getLatLng(
            externalNode.geojson ? externalNode.geojson : externalNode.geojsonManual
        );
        const type = _getNodeType(externalNode.soltyyppi, externalNode.soltunnus);

        return {
            coordinates,
            type,
            id: externalNode.soltunnus,
            transitTypes: externalNode.transitTypes
                ? (externalNode.transitTypes.split(',') as TransitType[])
                : [],
            dateRanges: externalNode.dateRanges!,
        };
    };

    public static createNewNode(coordinates: L.LatLng): INode {
        const newStop = NodeStopFactory.createNewStop();
        return {
            coordinates,
            id: '',
            internalId: `node-${numberIterator.getNumber()}`,
            stop: newStop,
            type: NodeType.STOP,
            transitTypes: [],
            coordinatesProjection: coordinates,
            modifiedOn: new Date(),
            modifiedBy: '',
            measurementType: '',
        };
    }
}

const _getLatLng = (coordinates: string) => {
    return roundLatLng(L.GeoJSON.coordsToLatLng(JSON.parse(coordinates).coordinates));
};

const _getNodeType = (nodeType: string, nodeId: string) => {
    switch (nodeType) {
        case 'X':
            return NodeType.CROSSROAD;
        case 'P':
            return NodeType.STOP;
        case '-':
            return NodeType.MUNICIPALITY_BORDER;
        default:
            throw new Error(`Solmun (id: '${nodeId}') tyyppi on
                virheellinen: ${nodeType}`);
    }
};

export default NodeFactory;
