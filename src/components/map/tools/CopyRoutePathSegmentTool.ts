import { reaction, IReactionDisposer } from 'mobx';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventListener, {
    INodeClickParams,
    IRoutePathNodeClickParams,
} from '~/helpers/EventListener';
import { IRoutePathLink } from '~/models';
import NodeService from '~/services/nodeService';
import RoutePathSegmentService from '~/services/routePathSegmentService';
import ErrorStore from '~/stores/errorStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import RoutePathCopySegmentStore, { ISegmentPoint } from '~/stores/routePathCopySegmentStore';
import RoutePathLayerStore from '~/stores/routePathLayerStore';
import RoutePathStore from '~/stores/routePathStore';
import ToolbarStore from '~/stores/toolbarStore';
import RoutePathUtils from '~/utils/RoutePathUtils';
import BaseTool from './BaseTool';

type toolPhase = 'selectStartNode' | 'selectEndNode' | 'selectRoutePathToCopy';

class CopyRoutePathSegmentTool implements BaseTool {
    private refreshToolPhaseListener: IReactionDisposer;
    public toolType = ToolbarToolType.CopyRoutePathSegment;
    public toolHelpHeader = 'Kopioi reitinsuunnan segmentti';
    public toolHelpPhasesMap = {
        selectStartNode: {
            phaseTopic: 'Alkusolmun valitseminen',
            phaseHelpText:
                'Valitse kartalta (tai sivupalkista) kopioitavan reitinsuunnan segmentin aloitus-solmu. Huom. kopioinnin jälkeen tarkista, että segmentin alku- ja loppusolmujen tiedot ovat oikein.',
        },
        selectEndNode: {
            phaseTopic: 'Loppusolmun valitseminen',
            phaseHelpText:
                'Valitse kartalta (tai sivupalkista) kopioitavan reitinsuunnan segmentin lopetus-solmu. Huom. kopioinnin jälkeen tarkista, että segmentin alku- ja loppusolmujen tiedot ovat oikein.',
        },
        selectRoutePathToCopy: {
            phaseTopic: 'Reitinsuunnan valitseminen',
            phaseHelpText:
                'Valitse reitinsuunta sivupalkista, jolta segmentti kopioidaan. Voit myös muuttaa alku- tai loppusolmun valintaa alku- ja loppusolmu -painikkeiden avulla. Huom. kopioinnin jälkeen tarkista, että segmentin alku- ja loppusolmujen tiedot ovat oikein.',
        },
    };
    public activate = () => {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventListener.on('networkNodeClick', this.onNetworkNodeClick);
        EventListener.on('routePathNodeClick', this.onRoutePathNodeClick);
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
        EventListener.off('routePathNodeClick', this.onRoutePathNodeClick);
        RoutePathCopySegmentStore.clear();
        this.refreshToolPhaseListener();
    };

    public getToolPhase = () => {
        return ToolbarStore.toolPhase;
    };

    public setToolPhase = (toolPhase: toolPhase | null) => {
        const toolHighlightedNodeIds = this.getHighlightedNodeIds(toolPhase);
        RoutePathLayerStore.setToolHighlightedNodeIds(toolHighlightedNodeIds);
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

    private getHighlightedNodeIds = (toolPhase: toolPhase | null) => {
        if (!toolPhase || toolPhase === 'selectRoutePathToCopy') return [];
        const coherentRoutePathLinksList = RoutePathUtils.getCoherentRoutePathLinksList(
            RoutePathStore.routePath!.routePathLinks
        );
        const nodeIdsAtCoherentRpLinkEdge: string[] = [];
        coherentRoutePathLinksList.forEach((rpLinks: IRoutePathLink[]) => {
            if (toolPhase === 'selectStartNode') {
                nodeIdsAtCoherentRpLinkEdge.push(rpLinks[rpLinks.length - 1].endNode.internalId);
            } else if (toolPhase === 'selectEndNode') {
                nodeIdsAtCoherentRpLinkEdge.push(rpLinks[0].startNode.internalId);
            } else {
                throw `ToolPhase not supported: ${toolPhase}`;
            }
        });
        return nodeIdsAtCoherentRpLinkEdge;
    };

    private onRoutePathNodeClick = (event: CustomEvent) => {
        const params: IRoutePathNodeClickParams = event.detail;
        const node = params.node;
        if (RoutePathLayerStore.toolHighlightedNodeIds.includes(node.internalId)) {
            const segmentPoint: ISegmentPoint = {
                nodeId: params.node.id,
                nodeInternalId: params.node.internalId,
                coordinates: node.coordinates,
            };
            this.setSegmentPoint(segmentPoint);
        }
    };

    private onNetworkNodeClick = async (clickEvent: CustomEvent) => {
        const params: INodeClickParams = clickEvent.detail;
        const nodeId = params.nodeId;
        const node = await NodeService.fetchNode(nodeId);
        const segmentPoint: ISegmentPoint = {
            nodeId,
            coordinates: node!.coordinates,
        };
        this.setSegmentPoint(segmentPoint);
    };

    private setSegmentPoint = async (segmentPoint: ISegmentPoint) => {
        if (RoutePathCopySegmentStore.setNodeType === 'startNode') {
            RoutePathCopySegmentStore.setStartSegmentPoint(segmentPoint);
        } else {
            RoutePathCopySegmentStore.setEndSegmentPoint(segmentPoint);
        }
        await this.fetchRoutePathLinkSegment();
        if (!RoutePathCopySegmentStore.endSegmentPoint) {
            RoutePathCopySegmentStore.setSetNodeType('endNode');
        }
        if (!RoutePathCopySegmentStore.startSegmentPoint) {
            RoutePathCopySegmentStore.setSetNodeType('startNode');
        }
        this.refreshToolPhase();
    };

    private fetchRoutePathLinkSegment = async () => {
        const startSegmentPoint = RoutePathCopySegmentStore.startSegmentPoint;
        const endSegmentPoint = RoutePathCopySegmentStore.endSegmentPoint;
        if (!startSegmentPoint || !endSegmentPoint) return;

        if (!startSegmentPoint.nodeInternalId && !endSegmentPoint.nodeInternalId) {
            ErrorStore.addError(
                'Ainakin toisen kopioitavan välin alku- tai loppusolmuista on kuuluttava reitinsuuntaan, johon segmentti kopioidaan.'
            );
            RoutePathCopySegmentStore.setNodePositionValidity(false);
            return;
        }

        if (startSegmentPoint.nodeId === endSegmentPoint.nodeId) {
            ErrorStore.addError('Kopioitavan välin alkusolmu ei saa olla sama kuin loppusolmu.');
            RoutePathCopySegmentStore.setNodePositionValidity(false);
            return;
        }
        RoutePathCopySegmentStore.setNodePositionValidity(true);

        RoutePathCopySegmentStore.setIsLoading(true);

        const transitType = RoutePathStore.routePath!.transitType!;
        const routePaths = await RoutePathSegmentService.fetchRoutePathLinkSegment(
            startSegmentPoint.nodeId,
            endSegmentPoint.nodeId,
            transitType
        );
        RoutePathCopySegmentStore.setRoutePaths(routePaths);
        RoutePathCopySegmentStore.setIsLoading(false);
    };
}

export default CopyRoutePathSegmentTool;
