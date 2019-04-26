import EventManager from '~/util/EventManager';
import ToolbarTool from '~/enums/toolbarTool';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import RoutePathCopySeqmentStore from '~/stores/routePathCopySeqmentStore';
import RoutePathStore from '~/stores/routePathStore';
import NodeService from '~/services/nodeService';
import RoutePathSeqmentService from '~/services/routePathSeqmentService';
import BaseTool from './BaseTool';
import { IEditRoutePathLayerNodeClickParams } from '../layers/edit/UpsertRoutePathLayer';
import { NetworkNodeClickParams } from '../layers/NetworkLayers';

class CopyRoutePathSeqmentTool implements BaseTool {
    public toolType = ToolbarTool.CopyRoutePathSeqmentTool;
    public toolHelpHeader = 'Kopioi reitinsuunnan segmentti';
    public toolHelpText = 'Valitse ensin kopioitavan välin alkusolmu kartalta. Tämän jälkeen valitse kopioitavan välin loppusolmu. Kun alku- ja loppusolmu ovat valitut, alku- ja loppusolmun välillä kulkevat reitinsuunnat (tuoreimmat) ilmestyvät sivupalkkiin. Valitse tämän jälkeen reitinsuunta, jolta segmentti kopioidaan.'; // tslint:disable-line max-line-length

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

        this.fetchRoutePathLinkSeqment();
    }

    private selectStartNode = async (clickEvent: CustomEvent) => {
        const params: IEditRoutePathLayerNodeClickParams = clickEvent.detail;
        RoutePathCopySeqmentStore.setStartNode(params.node);

        this.fetchRoutePathLinkSeqment();
    }

    private fetchRoutePathLinkSeqment = async () => {
        const startNode = RoutePathCopySeqmentStore.startNode;
        const endNode = RoutePathCopySeqmentStore.endNode;
        if (!startNode || !endNode) return;

        RoutePathCopySeqmentStore.setIsLoading(true);

        const transitType = RoutePathStore.routePath!.transitType;

        const routePaths = await RoutePathSeqmentService
            .fetchRoutePathLinkSeqment(startNode.nodeId, endNode.nodeId, transitType);
        RoutePathCopySeqmentStore.setRoutePaths(routePaths);
        RoutePathCopySeqmentStore.setIsLoading(false);
    }
}

export default CopyRoutePathSeqmentTool;
