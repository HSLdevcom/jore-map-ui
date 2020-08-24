import NodeType from '~/enums/nodeType';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventListener, {
    IEditRoutePathLayerNodeClickParams,
    IEditRoutePathNeighborLinkClickParams,
    INodeClickParams,
} from '~/helpers/EventListener';
import NodeService from '~/services/nodeService';
import RoutePathNeighborLinkService from '~/services/routePathNeighborLinkService';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import RoutePathLayerStore, { NeighborToAddType } from '~/stores/routePathLayerStore';
import RoutePathStore from '~/stores/routePathStore';
import BaseTool from './BaseTool';

/**
 * Tool for creating new routePath
 */
class ExtendRoutePathTool implements BaseTool {
    public toolType = ToolbarToolType.ExtendRoutePath;
    public toolHelpHeader = 'Laajenna reitinsuuntaa';
    public toolHelpText =
        'Valitse kartalta ensin aloitus-solmu. Tämän jälkeen jatka reitinsuunnan laajentamista virheitä tai punaisia solmuja klikkailemalla. Solmun sisällä oleva numero kertoo, kuinka monta reitinsuuntaa tällä hetkellä käyttää kyseistä solmua.';
    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventListener.on('networkNodeClick', this.onNetworkNodeClick);
        EventListener.on('editRoutePathLayerNodeClick', this.onNodeClick);
        EventListener.on('editRoutePathNeighborLinkClick', this.addNeighborLinkToRoutePath);
        RoutePathStore.setIsEditingDisabled(false);
        EventListener.on('escape', this.onEscapePress);
    }
    public deactivate() {
        this.reset();
        EventListener.off('networkNodeClick', this.onNetworkNodeClick);
        EventListener.off('editRoutePathLayerNodeClick', this.onNodeClick);
        EventListener.off('editRoutePathNeighborLinkClick', this.addNeighborLinkToRoutePath);
        EventListener.off('escape', this.onEscapePress);
    }

    private reset() {
        RoutePathLayerStore.setNeighborLinks([]);
    }

    // Node click
    private onNodeClick = (clickEvent: CustomEvent) => {
        const params: IEditRoutePathLayerNodeClickParams = clickEvent.detail;
        this.fetchNeighborRoutePathLinks(params.node.id, params.linkOrderNumber);
    };

    // Network node click
    private onNetworkNodeClick = async (clickEvent: CustomEvent) => {
        if (!this.isNetworkNodesInteractive()) return;
        const params: INodeClickParams = clickEvent.detail;
        const nodeId = params.nodeId;
        const node = await NodeService.fetchNode(nodeId);
        if (node!.type !== NodeType.STOP) return;

        this.fetchNeighborRoutePathLinks(nodeId, 1);
    };

    private onEscapePress = () => {
        RoutePathLayerStore.setNeighborLinks([]);
    };

    private isNetworkNodesInteractive() {
        return RoutePathStore!.routePath && RoutePathStore!.routePath!.routePathLinks.length === 0;
    }

    // Neighbor link click
    private addNeighborLinkToRoutePath = async (clickEvent: CustomEvent) => {
        const params: IEditRoutePathNeighborLinkClickParams = clickEvent.detail;
        const routePathLink = params.neighborLink.routePathLink;

        RoutePathStore!.addLink(routePathLink);
        const neighborToAddType = RoutePathLayerStore!.neighborToAddType;
        const nodeToFetch =
            neighborToAddType === NeighborToAddType.AfterNode
                ? routePathLink.endNode
                : routePathLink.startNode;
        if (RoutePathStore.hasNodeOddAmountOfNeighbors(nodeToFetch.id)) {
            this.fetchNeighborRoutePathLinks(nodeToFetch.id, routePathLink.orderNumber);
        }
    };

    private fetchNeighborRoutePathLinks = async (nodeId: string, linkOrderNumber: number) => {
        const queryResult = await RoutePathNeighborLinkService.fetchNeighborRoutePathLinks(
            nodeId,
            RoutePathStore!.routePath!,
            linkOrderNumber
        );
        if (queryResult) {
            RoutePathLayerStore.setNeighborLinks(queryResult.neighborLinks);
            RoutePathLayerStore.setNeighborToAddType(queryResult.neighborToAddType);
        }
    };
}

export default ExtendRoutePathTool;
