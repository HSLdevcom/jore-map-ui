import ToolbarToolType from '~/enums/toolbarToolType';
import EventHelper, { INetworkNodeClickParams, INodeClickParams } from '~/helpers/EventHelper';
import { INode } from '~/models';
import NodeService from '~/services/nodeService';
import RoutePathSegmentService from '~/services/routePathSegmentService';
import ErrorStore from '~/stores/errorStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import RoutePathCopySegmentStore from '~/stores/routePathCopySegmentStore';
import RoutePathLayerStore from '~/stores/routePathLayerStore';
import RoutePathStore from '~/stores/routePathStore';
import { loopRoutePathNodes } from '~/utils/modelUtils';
import BaseTool from './BaseTool';

class CopyRoutePathSegmentTool implements BaseTool {
    public toolType = ToolbarToolType.CopyRoutePathSegmentTool;
    public toolHelpHeader = 'Kopioi reitinsuunnan segmentti';
    public toolHelpText =
        'Valitse kopioitava väli kartalta tämän työkaluohjeen alla olevien nappien (alkusolmu ja loppusolmu) avulla. Kun sekä alku- ja loppusolmu ovat valitut ja toinen alku- tai loppusolmuista kuuluu valitulle reitinsuunnalle, alku- ja loppusolmun välillä kulkevat reitinsuunnat (tuoreimmat) haetaan sivupalkkiin. Valitse tämän jälkeen reitinsuunta sivupalkista, jolta segmentti kopioidaan.';

    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventHelper.on('networkNodeClick', this.onNetworkNodeClick);
        EventHelper.on('nodeClick', this.onNodeClick);
        EventHelper.on('editRoutePathLayerNodeClick', this.onNodeClick);
        this.highlightClickableNodes();
        RoutePathStore.setIsEditingDisabled(false);
    }
    public deactivate() {
        EventHelper.off('networkNodeClick', this.onNetworkNodeClick);
        EventHelper.off('nodeClick', this.onNodeClick);
        EventHelper.off('editRoutePathLayerNodeClick', this.onNodeClick);
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
        RoutePathCopySegmentStore.setStartNode(node!);

        await this.fetchRoutePathLinkSegment();

        if (!RoutePathCopySegmentStore.endNode) {
            RoutePathCopySegmentStore.setSetNodeType('endNode');
        }
    };

    private selectEndNode = async (nodeId: string) => {
        const node = await NodeService.fetchNode(nodeId);
        RoutePathCopySegmentStore.setEndNode(node!);

        await this.fetchRoutePathLinkSegment();

        if (!RoutePathCopySegmentStore.startNode) {
            RoutePathCopySegmentStore.setSetNodeType('startNode');
        }
    };

    private fetchRoutePathLinkSegment = async () => {
        const startNode = RoutePathCopySegmentStore.startNode;
        const endNode = RoutePathCopySegmentStore.endNode;
        if (!startNode || !endNode) return;

        if (!this.isStartNodeOnRoutePath(startNode.id) && !this.isEndNodeOnRoutePath(endNode.id)) {
            ErrorStore.addError(
                'Ainakin toisen kopioitavan välin alku- tai loppusolmuista on kuuluttava reitinsuuntaan, johon segmentti kopioidaan.'
            );
            RoutePathCopySegmentStore.setNodePositionValidity(false);
            return;
        }

        if (startNode.id === endNode.id) {
            ErrorStore.addError('Kopioitavan välin alkusolmu ei saa olla sama kuin loppusolmu.');
            RoutePathCopySegmentStore.setNodePositionValidity(false);
            return;
        }
        RoutePathCopySegmentStore.setNodePositionValidity(true);

        RoutePathCopySegmentStore.setIsLoading(true);

        const transitType = RoutePathStore.routePath!.transitType!;
        const routePaths = await RoutePathSegmentService.fetchRoutePathLinkSegment(
            startNode.id,
            endNode.id,
            transitType
        );
        RoutePathCopySegmentStore.setRoutePaths(routePaths);
        RoutePathCopySegmentStore.setIsLoading(false);
    };

    private isStartNodeOnRoutePath(nodeId: string) {
        const routePathLinks = RoutePathStore.routePath!.routePathLinks;
        return routePathLinks.some((link) => link.endNode.id === nodeId);
    }

    private isEndNodeOnRoutePath(nodeId: string) {
        const routePathLinks = RoutePathStore.routePath!.routePathLinks;
        return routePathLinks.some((link) => link.startNode.id === nodeId);
    }

    private highlightClickableNodes() {
        const routePath = RoutePathStore!.routePath!;

        const clickableNodeIds: string[] = [];
        const unclickableNodeIds: string[] = [];
        loopRoutePathNodes(routePath, (node: INode) => {
            if (RoutePathStore!.hasNodeOddAmountOfNeighbors(node.id)) {
                clickableNodeIds.push(node.id);
            } else {
                unclickableNodeIds.push(node.id);
            }
        });
        RoutePathLayerStore!.setToolHighlightedNodeIds(clickableNodeIds);
    }

    private unhighlightClickableNodes() {
        RoutePathLayerStore!.setToolHighlightedNodeIds([]);
    }
}

export default CopyRoutePathSegmentTool;
