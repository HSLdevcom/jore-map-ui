import NodeType from '~/enums/nodeType';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventHelper, {
    IEditRoutePathLayerNodeClickParams,
    IEditRoutePathNeighborLinkClickParams,
    INodeClickParams,
} from '~/helpers/EventHelper';
import { INode } from '~/models';
import NodeService from '~/services/nodeService';
import RoutePathNeighborLinkService from '~/services/routePathNeighborLinkService';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import RoutePathLayerStore, { NeighborToAddType } from '~/stores/routePathLayerStore';
import RoutePathStore from '~/stores/routePathStore';
import { loopRoutePathNodes } from '~/utils/modelUtils';
import BaseTool from './BaseTool';

/**
 * Tool for creating new routePath
 */
class ExtendRoutePathTool implements BaseTool {
    public toolType = ToolbarToolType.AddNewRoutePathLink;
    public toolHelpHeader = 'Laajenna reitinsuuntaa';
    public toolHelpText =
        'Valitse kartalta ensin aloitus-solmu. Tämän jälkeen jatka reitinsuunnan laajentamista virheitä tai punaisia solmuja klikkailemalla. Solmun sisällä oleva numero kertoo, kuinka monta reitinsuuntaa tällä hetkellä käyttää kyseistä solmua.';
    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventHelper.on('networkNodeClick', this.onNetworkNodeClick);
        EventHelper.on('editRoutePathLayerNodeClick', this.onNodeClick);
        EventHelper.on('editRoutePathNeighborLinkClick', this.addNeighborLinkToRoutePath);
        this.highlightClickableNodes();
        RoutePathStore.setIsEditingDisabled(false);
        EventHelper.on('undo', this.highlightClickableNodes);
        EventHelper.on('redo', this.highlightClickableNodes);
        EventHelper.on('escape', this.onEscapePress);
    }
    public deactivate() {
        this.reset();
        EventHelper.off('networkNodeClick', this.onNetworkNodeClick);
        EventHelper.off('editRoutePathLayerNodeClick', this.onNodeClick);
        EventHelper.off('editRoutePathNeighborLinkClick', this.addNeighborLinkToRoutePath);
        EventHelper.off('undo', this.highlightClickableNodes);
        EventHelper.off('redo', this.highlightClickableNodes);
        EventHelper.off('escape', this.onEscapePress);
    }

    private reset() {
        RoutePathLayerStore.setNeighborLinks([]);
        this.unhighlightClickableNodes();
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
        this.highlightClickableNodes();
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
            this.unhighlightClickableNodes();
            this.fetchNeighborRoutePathLinks(nodeToFetch.id, routePathLink.orderNumber);
        } else {
            this.highlightClickableNodes();
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
            this.unhighlightClickableNodes();
        } else {
            this.highlightClickableNodes();
        }
    };

    private highlightClickableNodes() {
        const routePath = RoutePathStore!.routePath!;

        const clickableNodeIds: string[] = [];
        loopRoutePathNodes(routePath, (node: INode) => {
            if (RoutePathStore!.hasNodeOddAmountOfNeighbors(node.id)) {
                clickableNodeIds.push(node.id);
            }
        });
        RoutePathLayerStore!.setToolHighlightedNodeIds(clickableNodeIds);
    }

    private unhighlightClickableNodes() {
        RoutePathLayerStore!.setToolHighlightedNodeIds([]);
    }
}

export default ExtendRoutePathTool;
