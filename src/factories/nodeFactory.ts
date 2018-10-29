import { INode, ICoordinate } from '~/models';
import NodeType from '~/enums/nodeType';
import NodeStopFactory from './nodeStopFactory';
import NotificationType from '../enums/notificationType';
import notificationStore from '../stores/notificationStore';

class NodeFactory {
    public static createNode = (node: any): INode => {
        const coordinateList = // Use less accurate location if measured location is missing.
            JSON.parse(node.geojson ? node.geojson : node.geojsonManual);
        const coordinate : ICoordinate = {
            lon: coordinateList.coordinates[0],
            lat: coordinateList.coordinates[1],
        };
        const nodeStop =  node.pysakkiBySoltunnus;
        const type = getNodeType(node.soltyyppi);

        // TODO: Change this when creating abstraction layers for reading from postgis
        if (type === NodeType.INVALID) {
            notificationStore.addNotification({
                message: `Solmun (id: '${node.soltunnus}') tyyppi on virheellinen`,
                type: NotificationType.WARNING,
            });
        }

        return {
            type,
            id: node.soltunnus,
            stop: nodeStop ? NodeStopFactory.createStop(nodeStop) : null,
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
    case '-':
        return NodeType.MUNICIPALITY_BORDER;
    default:
        return NodeType.INVALID;
    }
};

export default NodeFactory;
