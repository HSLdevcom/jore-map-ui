import { INode } from '../models';
import NodeType from '../enums/nodeType';

class NodeFactory {
    public static createNode = (node: any): INode => {
        return <INode>{
            id: node.relid,
            type: getNodeType(node.solmuByLnkalkusolmu.soltyyppi),
            geoJson: JSON.parse(node.solmuByLnkalkusolmu.geojson),
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
