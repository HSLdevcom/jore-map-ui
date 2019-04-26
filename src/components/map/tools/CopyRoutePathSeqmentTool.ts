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
    public toolHelpText = 'Valitse kopioitava väli kartalta. Tämän työkaluohjeen alla oleva korostettu nappi (alkusolmu/loppusolmu) kertoo kumpi solmu tullaan asettamaan seuraavaksi kun solmu valitaan kartalta. Kun sekä alku- ja loppusolmu ovat valitut, alku- ja loppusolmun välillä kulkevat reitinsuunnat (tuoreimmat) ilmestyvät sivupalkkiin. Valitse tämän jälkeen reitinsuunta, jolta segmentti kopioidaan.'; // tslint:disable-line max-line-length

    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventManager.on('networkNodeClick', this.onNetworkNodeClick);
        EventManager.on('nodeClick', this.onNodeClick);
    }
    public deactivate() {
        EventManager.off('networkNodeClick', this.onNetworkNodeClick);
        EventManager.off('nodeClick', this.onNodeClick);
        RoutePathCopySeqmentStore.clear();
    }

    private onNodeClick = (clickEvent: CustomEvent) => {
        const setNodeType = RoutePathCopySeqmentStore.setNodeType;
        const params: IEditRoutePathLayerNodeClickParams = clickEvent.detail;

        if (setNodeType === 'startNode') this.selectStartNode(params.node.id);
        else this.selectEndNode(params.node.id);
    }

    private onNetworkNodeClick = (clickEvent: CustomEvent) => {
        const setNodeType = RoutePathCopySeqmentStore.setNodeType;
        const params: NetworkNodeClickParams = clickEvent.detail;

        if (setNodeType === 'startNode') this.selectStartNode(params.nodeId);
        else this.selectEndNode(params.nodeId);
    }

    private selectEndNode = async (nodeId: string) => {
        const node = await NodeService.fetchNode(nodeId);
        RoutePathCopySeqmentStore.setEndNode(node);

        await this.fetchRoutePathLinkSeqment();

        if (!RoutePathCopySeqmentStore.startNode) {
            RoutePathCopySeqmentStore.setSetNodeType('startNode');
        }
    }

    private selectStartNode = async (nodeId: string) => {
        const node = await NodeService.fetchNode(nodeId);
        RoutePathCopySeqmentStore.setStartNode(node);

        await this.fetchRoutePathLinkSeqment();

        if (!RoutePathCopySeqmentStore.endNode) {
            RoutePathCopySeqmentStore.setSetNodeType('endNode');
        }
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
