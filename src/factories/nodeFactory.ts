import { INode, ICoordinate } from '../models';
import NodeType from '../enums/nodeType';

class NodeFactory {
    public static createNode = (internalRoutePathId: string, node: any): INode => {
        const coordinateList = JSON.parse(node.solmuByLnkalkusolmu.geojson);
        const coordinate : ICoordinate = {
            lon: coordinateList.coordinates[0],
            lat: coordinateList.coordinates[1],
        };

        return <INode>{
            internalRoutePathId,
            id: node.relid,
            type: getNodeType(node.solmuByLnkalkusolmu.soltyyppi),
            coordinates: coordinate,
        };
    }

    public static createStartingPointNode = (coordinates: any): INode => {
        const coordinate : ICoordinate = {
            lon: coordinates[0],
            lat: coordinates[1],
        };
        return <INode>{
            internalRoutePathId: '0',
            id: 0,
            type: NodeType.START,
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
