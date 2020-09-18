import { reaction, IReactionDisposer } from 'mobx';
import NodeSize from '~/enums/nodeSize';
import NodeType from '~/enums/nodeType';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventListener, {
    IEditRoutePathNeighborLinkClickParams,
    INodeClickParams,
    IRoutePathNodeClickParams,
} from '~/helpers/EventListener';
import { IRoutePathLink } from '~/models';
import NodeService from '~/services/nodeService';
import RoutePathNeighborLinkService from '~/services/routePathNeighborLinkService';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import RoutePathLayerStore, { NeighborToAddType } from '~/stores/routePathLayerStore';
import RoutePathStore from '~/stores/routePathStore';
import ToolbarStore from '~/stores/toolbarStore';
import RoutePathUtils from '~/utils/RoutePathUtils';
import BaseTool from './BaseTool';

type toolPhase = 'selectFirstNode' | 'selectNodeToExtend' | 'selectNeighborLink';

/**
 * Tool for creating new routePath
 */
class ExtendRoutePathTool implements BaseTool {
    private refreshToolPhaseListener: IReactionDisposer;
    private isToolPhaseSwitchingPrevented = false;
    public toolType = ToolbarToolType.ExtendRoutePath;
    public toolHelpPhasesMap = {
        selectFirstNode: {
            phaseTopic: 'Aloitus-solmun valitseminen',
            phaseHelpText:
                'Valitse kartalta pysäkki, josta haluat aloittaa reitinsuunnan muodostamisen.',
        },
        selectNodeToExtend: {
            phaseTopic: 'Laajennettavan solmun valitseminen',
            phaseHelpText:
                'Valitse reitinsuunnalta solmu, josta haluat jatkaa reitinsuunnan laajentamista. Valittavat solmut ovat korostettuina vihreällä kartalla ja sivupalkissa.',
        },
        selectNeighborLink: {
            phaseTopic: 'Naapurisolmun valitseminen',
            phaseHelpText:
                'Valitse vihreällä tai punaisella merkattu naapurisolmu ja siihen johtava linkki laajentaaksesi reitinsuuntaa. Solmun sisällä oleva numero kertoo, montako reitinsuuntaa käyttää kyseistä solmua. Voit myös klikata naapurisolmua oikealla hiiren painikkeella nähdäksesi tarkemmin solmua käyttävät reitinsuunnat.',
        },
    };
    public toolHelpHeader = 'Laajenna reitinsuuntaa';

    public activate = () => {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventListener.on('networkNodeClick', this.onNetworkNodeClick);
        EventListener.on('routePathNodeClick', this.onRoutePathNodeClick);
        EventListener.on('editRoutePathNeighborLinkClick', this.onEditRoutePathNeighborLinkClick);
        RoutePathStore.setIsEditingDisabled(false);
        EventListener.on('escape', this.onEscapePress);
        this.refreshToolPhaseListener = reaction(
            () => [
                RoutePathStore.routePath?.routePathLinks.length,
                RoutePathLayerStore.neighborLinks.length,
            ],
            this.refreshToolPhase
        );
        this.refreshToolPhase();
    };

    public deactivate = () => {
        this.setToolPhase(null);
        RoutePathLayerStore.setNeighborLinks([]);
        EventListener.off('networkNodeClick', this.onNetworkNodeClick);
        EventListener.off('routePathNodeClick', this.onRoutePathNodeClick);
        EventListener.off('editRoutePathNeighborLinkClick', this.onEditRoutePathNeighborLinkClick);
        EventListener.off('escape', this.onEscapePress);
        this.refreshToolPhaseListener();
    };

    public getToolPhase = () => {
        return ToolbarStore.toolPhase;
    };

    public setToolPhase = (toolPhase: toolPhase | null) => {
        if (this.isToolPhaseSwitchingPrevented) return;
        const toolHighlightedNodeIds =
            toolPhase === 'selectNodeToExtend' ? this.getHighlightedNodeIds() : [];
        RoutePathLayerStore.setToolHighlightedNodeIds(toolHighlightedNodeIds);

        if (toolPhase === 'selectFirstNode') {
            NetworkStore.setNodeSize(NodeSize.NORMAL);
        } else {
            NetworkStore.setNodeSize(NodeSize.SMALL);
        }
        ToolbarStore.setToolPhase(toolPhase);
    };

    private refreshToolPhase = () => {
        if (RoutePathLayerStore.neighborLinks.length > 0) {
            this.setToolPhase('selectNeighborLink');
        } else if (RoutePathStore.routePath?.routePathLinks.length === 0) {
            this.setToolPhase('selectFirstNode');
        } else {
            this.setToolPhase('selectNodeToExtend');
        }
    };

    private getHighlightedNodeIds = () => {
        const coherentRoutePathLinksList = RoutePathUtils.getCoherentRoutePathLinksList(
            RoutePathStore.routePath!.routePathLinks
        );
        const nodeIdsAtCoherentRpLinkEdge: string[] = [];
        coherentRoutePathLinksList.forEach((rpLinks: IRoutePathLink[]) => {
            nodeIdsAtCoherentRpLinkEdge.push(rpLinks[0].startNode.internalId);
            nodeIdsAtCoherentRpLinkEdge.push(rpLinks[rpLinks.length - 1].endNode.internalId);
        });
        return nodeIdsAtCoherentRpLinkEdge;
    };

    private onRoutePathNodeClick = (clickEvent: CustomEvent) => {
        const params: IRoutePathNodeClickParams = clickEvent.detail;
        const nodeId = params.node.id;
        const internalId = params.node.internalId;
        if (RoutePathLayerStore.toolHighlightedNodeIds.includes(internalId)) {
            this.fetchNeighborRoutePathLinks({
                nodeId,
                linkOrderNumber: params.linkOrderNumber,
                isFirstNodeClick: false,
            });
        } else {
            const clickParams: INodeClickParams = { nodeId };
            EventListener.trigger('nodeClick', clickParams);
        }
    };

    private onNetworkNodeClick = async (clickEvent: CustomEvent) => {
        if (this.getToolPhase() !== 'selectFirstNode') return;

        const params: INodeClickParams = clickEvent.detail;
        const nodeId = params.nodeId;
        const node = await NodeService.fetchNode(nodeId);
        if (node!.type !== NodeType.STOP) return;

        this.fetchNeighborRoutePathLinks({ nodeId, linkOrderNumber: 1, isFirstNodeClick: true });
    };

    private onEscapePress = () => {
        RoutePathLayerStore.setNeighborLinks([]);
    };

    private onEditRoutePathNeighborLinkClick = async (clickEvent: CustomEvent) => {
        const params: IEditRoutePathNeighborLinkClickParams = clickEvent.detail;
        const routePathLink = params.neighborLink.routePathLink;

        this.isToolPhaseSwitchingPrevented = true;
        RoutePathStore!.addLink({
            routePathLink,
            isBookSchedulePropertiesCopyToRoutePathPrevented: false,
        });
        const neighborToAddType = RoutePathLayerStore!.neighborToAddType;
        const nodeToFetch =
            neighborToAddType === NeighborToAddType.AfterNode
                ? routePathLink.endNode
                : routePathLink.startNode;
        if (RoutePathStore.hasNodeOddAmountOfNeighbors(nodeToFetch.internalId)) {
            this.fetchNeighborRoutePathLinks({
                nodeId: nodeToFetch.id,
                linkOrderNumber: routePathLink.orderNumber,
                isFirstNodeClick: false,
            });
        } else {
            this.isToolPhaseSwitchingPrevented = false;
            this.refreshToolPhase();
        }
    };

    private fetchNeighborRoutePathLinks = async ({
        nodeId,
        linkOrderNumber,
        isFirstNodeClick,
    }: {
        nodeId: string;
        linkOrderNumber: number;
        isFirstNodeClick: boolean;
    }) => {
        const queryResult = await RoutePathNeighborLinkService.fetchNeighborRoutePathLinks(
            nodeId,
            RoutePathStore!.routePath!,
            linkOrderNumber
        );
        this.isToolPhaseSwitchingPrevented = false;
        if (queryResult) {
            // Node id to fetch neighborLinks from might not exist (if user has quickly done undo for example)
            const isNodeIdFound = Boolean(
                RoutePathStore.routePath!.routePathLinks.find(
                    (rpLink) => rpLink.startNode.id === nodeId || rpLink.endNode.id === nodeId
                )
            );
            if (isFirstNodeClick || isNodeIdFound) {
                RoutePathLayerStore.setNeighborLinks(queryResult.neighborLinks);
                RoutePathLayerStore.setNeighborToAddType(queryResult.neighborToAddType);
            }
        } else {
            this.refreshToolPhase();
        }
    };
}

export default ExtendRoutePathTool;
