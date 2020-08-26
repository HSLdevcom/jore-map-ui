import { reaction, IReactionDisposer } from 'mobx';
import NodeSize from '~/enums/nodeSize';
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
import ToolbarStore from '~/stores/toolbarStore';
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
                'Valitse reitinsuunnalta solmu, josta haluat jatkaa reitinsuunnan laajentamista. Valittavat solmut ovat korostettuina vihreällä.',
        },
        selectNeighborLink: {
            phaseTopic: 'Naapurisolmun valitseminen',
            phaseHelpText:
                'Valitse vihreällä tai punaisella merkattu naapurisolmu ja siihen johtava linkki laajentaaksesi reitinsuuntaa. Solmun sisällä oleva numero kertoo, montako reitinsuuntaa käyttää kyseistä solmua. Voit myös klikata naapurisolmua oikealla hiiren painikkeella nähdäksesi tarkemmin solmua käyttävät reitinsuunnat.',
        },
    };
    public toolHelpHeader = 'Laajenna reitinsuuntaa';
    public toolHelpText =
        'Valitse kartalta ensin aloitus-solmu. Tämän jälkeen jatka reitinsuunnan laajentamista virheitä tai punaisia solmuja klikkailemalla. Solmun sisällä oleva numero kertoo, kuinka monta reitinsuuntaa tällä hetkellä käyttää kyseistä solmua.';

    public activate = () => {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventListener.on('networkNodeClick', this.onNetworkNodeClick);
        EventListener.on('editRoutePathLayerNodeClick', this.onNodeClick);
        EventListener.on('editRoutePathNeighborLinkClick', this.addNeighborLinkToRoutePath);
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
        EventListener.off('editRoutePathLayerNodeClick', this.onNodeClick);
        EventListener.off('editRoutePathNeighborLinkClick', this.addNeighborLinkToRoutePath);
        EventListener.off('escape', this.onEscapePress);
        this.refreshToolPhaseListener();
    };

    public getToolPhase = () => {
        return ToolbarStore.toolPhase;
    };

    public setToolPhase = (toolPhase: toolPhase | null) => {
        if (this.isToolPhaseSwitchingPrevented) return;

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

    // Node click
    private onNodeClick = (clickEvent: CustomEvent) => {
        const params: IEditRoutePathLayerNodeClickParams = clickEvent.detail;
        this.fetchNeighborRoutePathLinks({
            nodeId: params.node.id,
            linkOrderNumber: params.linkOrderNumber,
            isFirstNodeClick: false,
        });
    };

    // Network node click
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

    // Neighbor link click
    private addNeighborLinkToRoutePath = async (clickEvent: CustomEvent) => {
        const params: IEditRoutePathNeighborLinkClickParams = clickEvent.detail;
        const routePathLink = params.neighborLink.routePathLink;

        this.isToolPhaseSwitchingPrevented = true;
        RoutePathStore!.addLink(routePathLink);
        const neighborToAddType = RoutePathLayerStore!.neighborToAddType;
        const nodeToFetch =
            neighborToAddType === NeighborToAddType.AfterNode
                ? routePathLink.endNode
                : routePathLink.startNode;
        if (RoutePathStore.hasNodeOddAmountOfNeighbors(nodeToFetch.id)) {
            this.fetchNeighborRoutePathLinks({
                nodeId: nodeToFetch.id,
                linkOrderNumber: routePathLink.orderNumber,
                isFirstNodeClick: false,
            });
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
