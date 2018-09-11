import { INode, ICoordinate } from '../models';
import NodeType from '../enums/nodeType';

class NodeFactory {
    public static createNode = (node: any): INode => {
        const coordinateList = JSON.parse(node.geojson);
        const coordinate : ICoordinate = {
            lon: coordinateList.coordinates[0],
            lat: coordinateList.coordinates[1],
        };

        return {
            id: node.soltunnus,
            type: getNodeType(node.soltyyppi),
            coordinates: coordinate,
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
