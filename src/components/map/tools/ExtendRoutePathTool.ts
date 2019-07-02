import RoutePathStore from '~/stores/routePathStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import NodeType from '~/enums/nodeType';
import ToolbarTool from '~/enums/toolbarTool';
import EventManager, { INetworkNodeClickParams } from '~/util/EventManager';
import RoutePathNeighborLinkService from '~/services/routePathNeighborLinkService';
import BaseTool from './BaseTool';

/**
 * Tool for creating new routePath
 */
class ExtendRoutePathTool implements BaseTool {
    public toolType = ToolbarTool.AddNewRoutePathLink;
    public toolHelpHeader = 'Laajenna reitinsuuntaa';
    public toolHelpText =
        'Valitse kartalta ensin aloitus-solmu. Tämän jälkeen jatka reitinsuunnan laajentamista virheitä tai punaisia solmuja klikkailemalla. Solmun sisällä oleva numero kertoo, kuinka monta reitinsuuntaa tällä hetkellä käyttää kyseistä solmua.';
    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventManager.on('networkNodeClick', this.onNetworkNodeClick);
    }
    public deactivate() {
        this.reset();
        EventManager.off('networkNodeClick', this.onNetworkNodeClick);
    }

    private reset() {
        RoutePathStore.setNeighborRoutePathLinks([]);
    }

    private onNetworkNodeClick = async (clickEvent: CustomEvent) => {
        if (!this.isNetworkNodesInteractive()) return;
        const params: INetworkNodeClickParams = clickEvent.detail;
        if (params.nodeType !== NodeType.STOP) return;
        const queryResult = await RoutePathNeighborLinkService.fetchNeighborRoutePathLinks(
            params.nodeId,
            RoutePathStore.routePath!,
            1
        );
        if (queryResult) {
            RoutePathStore!.setNeighborRoutePathLinks(
                queryResult!.neighborLinks
            );
            RoutePathStore!.setNeighborToAddType(
                queryResult!.neighborToAddType
            );
        }
    };

    private isNetworkNodesInteractive() {
        return (
            RoutePathStore!.routePath &&
            RoutePathStore!.routePath!.routePathLinks.length === 0
        );
    }
}

export default ExtendRoutePathTool;
