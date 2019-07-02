import { INode } from '~/models';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';

type eventName =
    | 'enter'
    | 'arrowUp'
    | 'arrowDown'
    | 'undo'
    | 'redo'
    | 'mapClick'
    | 'routePathNodeClick'
    | 'networkNodeClick'
    | 'networkLinkClick'
    | 'geometryChange';

class EventManager {
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

interface IRoutePathNodeClickParams {
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

export default new EventManager();

export {
    IRoutePathNodeClickParams,
    INetworkNodeClickParams,
    INetworkLinkClickParams
};
