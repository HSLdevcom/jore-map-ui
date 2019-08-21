import EventManager, {
    INodeClickParams,
    INetworkNodeClickParams
} from '~/util/EventManager';
import ToolbarTool from '~/enums/toolbarTool';
import ErrorStore from '~/stores/errorStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import RoutePathCopySegmentStore from '~/stores/routePathCopySegmentStore';
import RoutePathStore from '~/stores/routePathStore';
import NodeService from '~/services/nodeService';
import RoutePathSegmentService from '~/services/routePathSegmentService';
import ModelHelper from '~/util/ModelHelper';
import { INode } from '~/models';
import BaseTool from './BaseTool';

class CopyRoutePathSegmentTool implements BaseTool {
    public toolType = ToolbarTool.CopyRoutePathSegmentTool;
    public toolHelpHeader = 'Kopioi reitinsuunnan segmentti';
    public toolHelpText =
        'Valitse kopioitava väli kartalta tämän työkaluohjeen alla olevien nappien (alkusolmu ja loppusolmu) avulla. Kun sekä alku- ja loppusolmu ovat valitut ja toinen alku- tai loppusolmuista kuuluu valitulle reitinsuunnalle, alku- ja loppusolmun välillä kulkevat reitinsuunnat (tuoreimmat) haetaan sivupalkkiin. Valitse tämän jälkeen reitinsuunta sivupalkista, jolta segmentti kopioidaan.';

    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventManager.on('networkNodeClick', this.onNetworkNodeClick);
        EventManager.on('nodeClick', this.onNodeClick);
        EventManager.on('editRoutePathLayerNodeClick', this.onNodeClick);
        this.highlightClickableNodes();
    }
    public deactivate() {
        EventManager.off('networkNodeClick', this.onNetworkNodeClick);
        EventManager.off('nodeClick', this.onNodeClick);
        EventManager.off('editRoutePathLayerNodeClick', this.onNodeClick);
        RoutePathCopySegmentStore.clear();
        this.unhighlightClickableNodes();
    }

    private onNodeClick = (clickEvent: CustomEvent) => {
        const setNodeType = RoutePathCopySegmentStore.setNodeType;
        const params: INodeClickParams = clickEvent.detail;

        if (setNodeType === 'startNode') this.selectStartNode(params.node.id);
        else this.selectEndNode(params.node.id);
    };

    private onNetworkNodeClick = (clickEvent: CustomEvent) => {
        const setNodeType = RoutePathCopySegmentStore.setNodeType;
        const params: INetworkNodeClickParams = clickEvent.detail;

        if (setNodeType === 'startNode') this.selectStartNode(params.nodeId);
        else this.selectEndNode(params.nodeId);
    };

    private selectStartNode = async (nodeId: string) => {
        const node = await NodeService.fetchNode(nodeId);
        RoutePathCopySegmentStore.setStartNode(node);

        await this.fetchRoutePathLinkSegment();

        if (!RoutePathCopySegmentStore.endNode) {
            RoutePathCopySegmentStore.setSetNodeType('endNode');
        }
    };

    private selectEndNode = async (nodeId: string) => {
        const node = await NodeService.fetchNode(nodeId);
        RoutePathCopySegmentStore.setEndNode(node);

        await this.fetchRoutePathLinkSegment();

        if (!RoutePathCopySegmentStore.startNode) {
            RoutePathCopySegmentStore.setSetNodeType('startNode');
        }
    };

    private fetchRoutePathLinkSegment = async () => {
        const startNode = RoutePathCopySegmentStore.startNode;
        const endNode = RoutePathCopySegmentStore.endNode;
        if (!startNode || !endNode) return;

        if (
            !this.isStartNodeOnRoutePath(startNode.nodeId) &&
            !this.isEndNodeOnRoutePath(endNode.nodeId)
        ) {
            ErrorStore.addError(
                'Ainakin toisen kopioitavan välin alku- tai loppusolmuista on kuuluttava reitinsuuntaan, johon segmentti kopioidaan.'
            );
            RoutePathCopySegmentStore.setNodePositionValidity(false);
            return;
        }

        if (startNode.nodeId === endNode.nodeId) {
            ErrorStore.addError(
                'Kopioitavan välin alkusolmu ei saa olla sama kuin loppusolmu.'
            );
            RoutePathCopySegmentStore.setNodePositionValidity(false);
            return;
        }
        RoutePathCopySegmentStore.setNodePositionValidity(true);

        RoutePathCopySegmentStore.setIsLoading(true);

        const transitType = RoutePathStore.routePath!.transitType;
        const routePaths = await RoutePathSegmentService.fetchRoutePathLinkSegment(
            startNode.nodeId,
            endNode.nodeId,
            transitType
        );
        RoutePathCopySegmentStore.setRoutePaths(routePaths);
        RoutePathCopySegmentStore.setIsLoading(false);
    };

    private isStartNodeOnRoutePath(nodeId: string) {
        const routePathLinks = RoutePathStore.routePath!.routePathLinks;
        return routePathLinks.some(link => link.endNode.id === nodeId);
    }

    private isEndNodeOnRoutePath(nodeId: string) {
        const routePathLinks = RoutePathStore.routePath!.routePathLinks;
        return routePathLinks.some(link => link.startNode.id === nodeId);
    }

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
        RoutePathStore!.setDisabledNodeIds(unclickableNodeIds);
    }

    private unhighlightClickableNodes() {
        RoutePathStore!.setToolHighlightedNodeIds([]);
        RoutePathStore.setDisabledNodeIds([]);
    }
}

export default CopyRoutePathSegmentTool;
