import RoutePathStore from '~/stores/routePathStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import NodeType from '~/enums/nodeType';
import ToolbarTool from '~/enums/toolbarTool';
import EventManager from '~/util/EventManager';
import RoutePathNeighborLinkService from '~/services/routePathNeighborLinkService';
import BaseTool from './BaseTool';
import { IEditRoutePathLayerNodeClickParams } from '../layers/edit/EditRoutePathLayer';
import { NetworkNodeClickParams } from '../layers/NetworkLayers';

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
        EventManager.on('nodeClick', this.onNodeClick);
    }
    public deactivate() {
        this.reset();
        EventManager.off('networkNodeClick', this.onNetworkNodeClick);
        EventManager.off('nodeClick', this.onNodeClick);
    }

    private reset() {
        RoutePathStore.setNeighborRoutePathLinks([]);
    }

    private onNetworkNodeClick = async (clickEvent: CustomEvent) => {
        if (!this.isNetworkNodesInteractive()) return;
        const params: NetworkNodeClickParams = clickEvent.detail;
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

    private onNodeClick = async (clickEvent: CustomEvent) => {
        const params: IEditRoutePathLayerNodeClickParams = clickEvent.detail;
        const node = params.node;
        const linkOrderNumber = params.linkOrderNumber;
        const queryResult = await RoutePathNeighborLinkService.fetchNeighborRoutePathLinks(
            node.id,
            RoutePathStore!.routePath!,
            linkOrderNumber
        );
        if (queryResult) {
            RoutePathStore!.setNeighborRoutePathLinks(
                queryResult.neighborLinks
            );
            RoutePathStore!.setNeighborToAddType(queryResult.neighborToAddType);
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
