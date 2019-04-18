import EventManager from '~/util/EventManager';
import ToolbarTool from '~/enums/toolbarTool';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import RoutePathCopySeqmentStore from '~/stores/routePathCopySeqmentStore';
import NodeService from '~/services/nodeService';
import RoutePathSeqmentService from '~/services/routePathSeqmentService';
import BaseTool from './BaseTool';
import { IEditRoutePathLayerNodeClickParams } from '../layers/edit/UpsertRoutePathLayer';
import { NetworkNodeClickParams } from '../layers/NetworkLayers';

class CopyRoutePathSeqmentTool implements BaseTool {
    public toolType = ToolbarTool.CopyRoutePathSeqmentTool;
    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventManager.on('networkNodeClick', this.selectEndNode);
        EventManager.on('nodeClick', this.selectStartNode);
    }
    public deactivate() {
        EventManager.off('networkNodeClick', this.selectEndNode);
        EventManager.off('nodeClick', this.selectStartNode);
        RoutePathCopySeqmentStore.clear();
    }

    private selectEndNode = async (clickEvent: CustomEvent) => {
        const params: NetworkNodeClickParams = clickEvent.detail;
        const node = await NodeService.fetchNode(params.nodeId);
        RoutePathCopySeqmentStore.setEndNode(node);
        const startNodeId = RoutePathCopySeqmentStore.startNode!.nodeId;
        const routePaths =
            await RoutePathSeqmentService.fetchRoutePathLinkSeqment(startNodeId, node.id);
        RoutePathCopySeqmentStore.setRoutePaths(routePaths);
    }

    private selectStartNode = async (clickEvent: CustomEvent) => {
        const params: IEditRoutePathLayerNodeClickParams = clickEvent.detail;

        RoutePathCopySeqmentStore.setStartNode(params.node);
    }
}

export default CopyRoutePathSeqmentTool;
