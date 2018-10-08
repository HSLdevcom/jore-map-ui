import { INode, ICoordinate } from '../models';
import NodeType from '../enums/nodeType';
import NodeStopFactory from './nodeStopFactory';

class NodeFactory {
    public static createNode = (node: any): INode => {
        const coordinateList = // Use less accurate location if measured location is missing.
            JSON.parse(node.geojson ? node.geojson : node.geojsonDisp);
        const coordinate : ICoordinate = {
            lon: coordinateList.coordinates[0],
            lat: coordinateList.coordinates[1],
        };
        const nodeStop =  node.pysakkiBySoltunnus;
        return {
            id: node.soltunnus,
            stop: nodeStop ? NodeStopFactory.createStop(nodeStop) : null,
            type: getNodeType(node.soltyyppi),
            coordinates: coordinate,
            measurementDate: node.mittpvm,
            modifiedOn: node.solviimpvm,
            modifiedBy: node.solkuka,
        };
    }
}

const getNodeType = (type:any) => {
    switch (type) {
    case 'X':
        return NodeType.CROSSROAD;
    case 'P':
        return NodeType.STOP;
    default:
        return NodeType.NOT_FOUND;
    }
};

export default NodeFactory;
