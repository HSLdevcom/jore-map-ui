import ToolbarToolType from '~/enums/toolbarToolType';
import EventListener, {
    INodeClickParams,
    IRoutePathNodeClickParams,
} from '~/helpers/EventListener';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import NodeService from '~/services/nodeService';
import ConfirmStore from '~/stores/confirmStore';
import ErrorStore from '~/stores/errorStore';
import LinkStore from '~/stores/linkStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import ToolbarStore from '~/stores/toolbarStore';
import BaseTool from './BaseTool';

type toolPhase = 'selectStartNode' | 'selectEndNode';

class AddNetworkLinkTool implements BaseTool {
    public toolType = ToolbarToolType.AddNetworkLink;
    public toolHelpHeader = 'Luo uusi linkki';
    public toolHelpPhasesMap = {
        selectStartNode: {
            phaseTopic: 'Alkusolmun valinta',
            phaseHelpText: 'Aloita linkin luonti valitsemalla linkin alkusolmu kartalta.',
        },
        selectEndNode: {
            phaseTopic: 'Loppusolmun valinta',
            phaseHelpText: 'Muodosta linkki valitsemalla linkin loppusolmu kartalta.',
        },
    };
    private startNodeId: string | null = null;
    private endNodeId: string | null = null;

    public activate = () => {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.unusedNode);
        NetworkStore.showMapLayer(MapLayer.link);
        NetworkStore.showMapLayer(MapLayer.unusedLink);
        EventListener.on('nodeClick', this.onNodeClick);
        EventListener.on('routePathNodeClick', this.onRoutePathNodeClick);
        EventListener.on('networkNodeClick', this.onNodeClick);
        this.setToolPhase('selectStartNode');
    };

    public deactivate = () => {
        this.resetTool();
        EventListener.off('nodeClick', this.onNodeClick);
        EventListener.off('routePathNodeClick', this.onRoutePathNodeClick);
        EventListener.off('networkNodeClick', this.onNodeClick);
        this.setToolPhase(null);
    };

    public getToolPhase = () => {
        return ToolbarStore.toolPhase;
    };

    public setToolPhase = (toolPhase: toolPhase | null) => {
        ToolbarStore.setToolPhase(toolPhase);
    };

    private onNodeClick = async (clickEvent: CustomEvent) => {
        const params: INodeClickParams = clickEvent.detail;
        this.setStartOrEndNode(params.nodeId);
    };

    private onRoutePathNodeClick = (clickEvent: CustomEvent) => {
        const params: IRoutePathNodeClickParams = clickEvent.detail;
        this.setStartOrEndNode(params.node.id);
    };

    private setStartOrEndNode = async (nodeId: string) => {
        if (!this.startNodeId) {
            this.startNodeId = nodeId;
            try {
                const startNode = await NodeService.fetchNode(nodeId);
                LinkStore.setMarkerCoordinates(startNode!.coordinates);
                this.setToolPhase('selectEndNode');
            } catch (e) {
                ErrorStore.addError(`Alkusolmun ${nodeId} haku epäonnistui`);
            }
        } else {
            this.endNodeId = nodeId;
            if (this.startNodeId === this.endNodeId) return;
            this.redirectToNewLinkView();
        }
    };

    private redirectToNewLinkView = () => {
        const newLinkViewLink = routeBuilder
            .to(SubSites.newLink)
            .toTarget(':id', [this.startNodeId, this.endNodeId].join(','))
            .toLink();

        ConfirmStore!.openConfirm({
            confirmData: 'Haluatko avata linkin luontinäkymän uudessa ikkunassa?',
            confirmButtonText: 'Kyllä',
            onConfirm: () => {
                ToolbarStore.selectTool(null);
                window.open(newLinkViewLink, '_blank');
            },
            onCancel: () => {
                ToolbarStore.selectTool(null);
                navigator.goTo({ link: newLinkViewLink });
            },
        });
    };

    private resetTool = () => {
        this.startNodeId = null;
        this.endNodeId = null;
        LinkStore.setMarkerCoordinates(null);
    };
}

export default AddNetworkLinkTool;
