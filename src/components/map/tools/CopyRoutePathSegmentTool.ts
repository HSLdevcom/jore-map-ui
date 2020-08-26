import { reaction, IReactionDisposer } from 'mobx';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventListener, {
    IEditRoutePathLayerNodeClickParams,
    INodeClickParams,
} from '~/helpers/EventListener';
import NodeService from '~/services/nodeService';
import RoutePathSegmentService from '~/services/routePathSegmentService';
import ErrorStore from '~/stores/errorStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import RoutePathCopySegmentStore from '~/stores/routePathCopySegmentStore';
import RoutePathStore from '~/stores/routePathStore';
import ToolbarStore from '~/stores/toolbarStore';
import BaseTool from './BaseTool';

type toolPhase = 'selectStartNode' | 'selectEndNode' | 'selectRoutePathToCopy';

class CopyRoutePathSegmentTool implements BaseTool {
    private refreshToolPhaseListener: IReactionDisposer;
    public toolType = ToolbarToolType.CopyRoutePathSegment;
    public toolHelpHeader = 'Kopioi reitinsuunnan segmentti';
    public toolHelpText =
        'Valitse kopioitava väli kartalta tämän työkaluohjeen alla olevien nappien (alkusolmu ja loppusolmu) avulla. Kun sekä alku- ja loppusolmu ovat valitut ja toinen alku- tai loppusolmuista kuuluu valitulle reitinsuunnalle, alku- ja loppusolmun välillä kulkevat reitinsuunnat (tuoreimmat) haetaan sivupalkkiin. Valitse tämän jälkeen reitinsuunta sivupalkista, jolta segmentti kopioidaan.';
    public toolHelpPhasesMap = {
        selectStartNode: {
            phaseTopic: 'Alkusolmun valitseminen',
            phaseHelpText: 'Valitse kartalta kopioitavan reitinsuunnan segmentin aloitus-solmu.',
        },
        selectEndNode: {
            phaseTopic: 'Loppusolmun valitseminen',
            phaseHelpText: 'Valitse kartalta kopioitavan reitinsuunnan segmentin lopetus-solmu.',
        },
        selectRoutePathToCopy: {
            phaseTopic: 'Reitinsuunnan valitseminen',
            phaseHelpText:
                'Valitse reitinsuunta sivupalkista, jolta segmentti kopioidaan. Voit myös muuttaa alku- tai loppusolmun valintaa alku- ja loppusolmu -painikkeiden avulla.',
        },
    };
    public activate = () => {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventListener.on('networkNodeClick', this.onNetworkNodeClick);
        EventListener.on('nodeClick', this.onNodeClick);
        EventListener.on('editRoutePathLayerNodeClick', this.onEditRoutePathLayerNodeClick);
        RoutePathStore.setIsEditingDisabled(false);
        this.refreshToolPhaseListener = reaction(
            () => [RoutePathCopySegmentStore.setNodeType, RoutePathCopySegmentStore.routePaths],
            this.refreshToolPhase
        );
        this.setToolPhase('selectStartNode');
    };

    public deactivate = () => {
        this.setToolPhase(null);
        EventListener.off('networkNodeClick', this.onNetworkNodeClick);
        EventListener.off('nodeClick', this.onNodeClick);
        EventListener.off('editRoutePathLayerNodeClick', this.onEditRoutePathLayerNodeClick);
        RoutePathCopySegmentStore.clear();
        this.refreshToolPhaseListener();
    };

    public getToolPhase = () => {
        return ToolbarStore.toolPhase;
    };

    public setToolPhase = (toolPhase: toolPhase | null) => {
        ToolbarStore.setToolPhase(toolPhase);
    };

    private refreshToolPhase = () => {
        if (RoutePathCopySegmentStore.routePaths.length > 0) {
            this.setToolPhase('selectRoutePathToCopy');
        } else if (RoutePathCopySegmentStore.setNodeType === 'startNode') {
            this.setToolPhase('selectStartNode');
        } else {
            this.setToolPhase('selectEndNode');
        }
    };

    private onNodeClick = (clickEvent: CustomEvent) => {
        const params: INodeClickParams = clickEvent.detail;
        this.selectNode(params.nodeId);
    };

    private onEditRoutePathLayerNodeClick = (clickEvent: CustomEvent) => {
        const params: IEditRoutePathLayerNodeClickParams = clickEvent.detail;
        this.selectNode(params.node.id);
    };

    private onNetworkNodeClick = (clickEvent: CustomEvent) => {
        const params: INodeClickParams = clickEvent.detail;
        this.selectNode(params.nodeId);
    };

    private selectNode = (nodeId: string) => {
        const setNodeType = RoutePathCopySegmentStore.setNodeType;
        if (setNodeType === 'startNode') this.selectStartNode(nodeId);
        else this.selectEndNode(nodeId);
    };

    private selectStartNode = async (nodeId: string) => {
        const node = await NodeService.fetchNode(nodeId);
        RoutePathCopySegmentStore.setStartNode(node!);

        await this.fetchRoutePathLinkSegment();

        if (!RoutePathCopySegmentStore.endNode) {
            RoutePathCopySegmentStore.setSetNodeType('endNode');
            this.refreshToolPhase();
        }
    };

    private selectEndNode = async (nodeId: string) => {
        const node = await NodeService.fetchNode(nodeId);
        RoutePathCopySegmentStore.setEndNode(node!);

        await this.fetchRoutePathLinkSegment();

        if (!RoutePathCopySegmentStore.startNode) {
            RoutePathCopySegmentStore.setSetNodeType('startNode');
            this.refreshToolPhase();
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
}

export default CopyRoutePathSegmentTool;
