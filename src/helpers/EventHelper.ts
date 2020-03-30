import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import { INeighborLink, INode } from '~/models';

type eventName =
    | 'keyUp'
    | 'shift'
    | 'ctrl'
    | 'enter'
    | 'arrowUp'
    | 'arrowDown'
    | 'undo'
    | 'redo'
    | 'mapClick'
    | 'nodeClick'
    | 'networkNodeClick'
    | 'networkLinkClick'
    | 'geometryChange'
    | 'editRoutePathLayerNodeClick'
    | 'editRoutePathNeighborLinkClick';

class EventHelper {
    public trigger(eventName: eventName, data?: any) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            detail: data
        });
        document.dispatchEvent(event);
    }
    public on(eventName: eventName, callback: (event: CustomEvent) => void) {
        document.addEventListener(eventName, callback);
    }

    public off(eventName: eventName, callback: (event: CustomEvent) => void) {
        document.removeEventListener(eventName, callback);
    }
}

interface INodeClickParams {
    node: INode;
}

interface INetworkNodeClickParams {
    nodeId: string;
    nodeType: NodeType;
}

interface INetworkLinkClickParams {
    startNodeId: string;
    endNodeId: NodeType;
    transitType: TransitType;
}

interface IEditRoutePathLayerNodeClickParams {
    node: INode;
    linkOrderNumber: number;
}

interface IEditRoutePathNeighborLinkClickParams {
    neighborLink: INeighborLink;
}

export default new EventHelper();

export {
    INodeClickParams,
    INetworkNodeClickParams,
    INetworkLinkClickParams,
    IEditRoutePathLayerNodeClickParams,
    IEditRoutePathNeighborLinkClickParams
};
