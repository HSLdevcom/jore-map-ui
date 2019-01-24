import * as L from 'leaflet';
import { INode } from '~/models';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import IExternalNode from '~/models/externals/IExternalNode';
import TransitTypeHelper from '~/util/transitTypeHelper';
import NodeStopFactory from './nodeStopFactory';
import NotificationType from '../enums/notificationType';
import notificationStore from '../stores/notificationStore';

class NodeFactory {
    public static createNode = (externalNode: IExternalNode): INode => {
         // Use less accurate location if measured location is missing.
        const coordinateList =
            JSON.parse(externalNode.geojson ? externalNode.geojson : externalNode.geojsonManual);
        const coordinates = new L.LatLng(
            coordinateList.coordinates[1],
            coordinateList.coordinates[0],
        );
        let shortId;
        if (externalNode.sollistunnus) {
            shortId = externalNode.solkirjain
            ? externalNode.solkirjain + externalNode.sollistunnus
            : externalNode.sollistunnus;
        }
        const nodeStop = externalNode.pysakkiBySoltunnus;
        const type = getNodeType(externalNode.soltyyppi);
        let transitTypes: TransitType[] = [];
        if (externalNode.transittypes) {
            transitTypes = externalNode.transittypes.split(',').map(transitTypeCode =>
                TransitTypeHelper.convertTransitTypeCodeToTransitType(transitTypeCode));
        }
        // TODO: Change this when creating abstraction layers for reading from postgis
        if (type === NodeType.INVALID) {
            notificationStore.addNotification({
                message: `Solmun (id: '${externalNode.soltunnus}') tyyppi on virheellinen`,
                type: NotificationType.WARNING,
            });
        }
        return {
            type,
            transitTypes,
            coordinates,
            shortId,
            id: externalNode.soltunnus,
            stop: nodeStop ? NodeStopFactory.createStop(nodeStop) : undefined,
            measurementDate: externalNode.mittpvm,
            modifiedOn: externalNode.solviimpvm,
            modifiedBy: externalNode.solkuka,
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
