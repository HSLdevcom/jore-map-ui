import { INode, ICoordinate } from '~/models';
import NodeType from '~/enums/nodeType';
import IExternalNode from '~/models/externals/IExternalNode';
import NodeStopFactory from './nodeStopFactory';
import NotificationType from '../enums/notificationType';
import notificationStore from '../stores/notificationStore';

class NodeFactory {
    public static createNode = (node: IExternalNode): INode => {
         // Use less accurate location if measured location is missing.
        const coordinateList =
            JSON.parse(node.geojson ? node.geojson : node.geojsonManual);
        const coordinates : ICoordinate = {
            lon: coordinateList.coordinates[0],
            lat: coordinateList.coordinates[1],
        };
        const nodeStop = node.pysakkiBySoltunnus;
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
            coordinates,
            id: node.soltunnus,
            stop: nodeStop ? NodeStopFactory.createStop(nodeStop) : null,
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
