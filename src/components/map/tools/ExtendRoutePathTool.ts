import RoutePathStore, { NeighborToAddType } from '~/stores/routePathStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import NodeType from '~/enums/nodeType';
import ToolbarTool from '~/enums/toolbarTool';
import { INode } from '~/models';
import EventManager, {
    INetworkNodeClickParams,
    IEditRoutePathLayerNodeClickParams,
    IEditRoutePathNeighborLinkClickParams
} from '~/util/EventManager';
import ModelHelper from '~/util/ModelHelper';
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
        EventManager.on('editRoutePathLayerNodeClick', this.onNodeClick);
        EventManager.on(
            'editRoutePathNeighborLinkClick',
            this.addNeighborLinkToRoutePath
        );
        this.highlightClickableNodes();
    }
    public deactivate() {
        this.reset();
        EventManager.off('networkNodeClick', this.onNetworkNodeClick);
        EventManager.off('editRoutePathLayerNodeClick', this.onNodeClick);
        EventManager.off(
            'editRoutePathNeighborLinkClick',
            this.addNeighborLinkToRoutePath
        );
    }

    private reset() {
        RoutePathStore.setNeighborRoutePathLinks([]);
        this.unhighlightClickableNodes();
    }

    // Node click
    private onNodeClick = (clickEvent: CustomEvent) => {
        const params: IEditRoutePathLayerNodeClickParams = clickEvent.detail;
        this.fetchNeighborRoutePathLinks(
            params.node.id,
            params.linkOrderNumber
        );
    };

    // Network node click
    private onNetworkNodeClick = async (clickEvent: CustomEvent) => {
        if (!this.isNetworkNodesInteractive()) return;
        const params: INetworkNodeClickParams = clickEvent.detail;
        if (params.nodeType !== NodeType.STOP) return;

        this.fetchNeighborRoutePathLinks(params.nodeId, 1);
    };

    private isNetworkNodesInteractive() {
        return (
            RoutePathStore!.routePath &&
            RoutePathStore!.routePath!.routePathLinks.length === 0
        );
    }

    // Neighbor link click
    private addNeighborLinkToRoutePath = async (clickEvent: CustomEvent) => {
        const params: IEditRoutePathNeighborLinkClickParams = clickEvent.detail;
        const routePathLink = params.neighborLink.routePathLink;

        RoutePathStore!.addLink(routePathLink);
        const neighborToAddType = RoutePathStore!.neighborToAddType;
        const nodeToFetch =
            neighborToAddType === NeighborToAddType.AfterNode
                ? routePathLink.endNode
                : routePathLink.startNode;
        if (RoutePathStore.hasNodeOddAmountOfNeighbors(nodeToFetch.id)) {
            this.unhighlightClickableNodes();
            this.fetchNeighborRoutePathLinks(
                nodeToFetch.id,
                routePathLink.orderNumber
            );
        } else {
            this.highlightClickableNodes();
        }
    };

    private fetchNeighborRoutePathLinks = async (
        nodeId: string,
        linkOrderNumber: number
    ) => {
        const queryResult = await RoutePathNeighborLinkService.fetchNeighborRoutePathLinks(
            nodeId,
            RoutePathStore!.routePath!,
            linkOrderNumber
        );
        if (queryResult) {
            RoutePathStore!.setNeighborRoutePathLinks(
                queryResult.neighborLinks
            );
            RoutePathStore!.setNeighborToAddType(queryResult.neighborToAddType);
            this.unhighlightClickableNodes();
        } else {
            this.highlightClickableNodes();
        }
    };

    private highlightClickableNodes() {
        const routePath = RoutePathStore!.routePath!;

        const clickableNodeIds: string[] = [];
        const unclickableNodeIds: string[] = [];
        ModelHelper.loopRoutePathNodes(routePath, (node: INode) => {
            if (RoutePathStore!.hasNodeOddAmountOfNeighbors(node.id)) {
                clickableNodeIds.push(node.id);
            } else {
                unclickableNodeIds.push(node.id);
            }
        });
        RoutePathStore!.setToolHighlightedNodeIds(clickableNodeIds);
    }

    private unhighlightClickableNodes() {
        RoutePathStore!.setToolHighlightedNodeIds([]);
    }
}

export default ExtendRoutePathTool;
