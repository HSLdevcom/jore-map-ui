import ToolbarToolType from '~/enums/toolbarToolType';
import EventListener, { INodeClickParams } from '~/helpers/EventListener';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import NodeService from '~/services/nodeService';
import ErrorStore from '~/stores/errorStore';
import LinkStore from '~/stores/linkStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import ToolbarStore from '~/stores/toolbarStore';
import BaseTool from './BaseTool';

type toolPhase = 'selectStartNode' | 'selectEndNode';

class AddNetworkLinkTool implements BaseTool {
    public toolType = ToolbarToolType.AddNetworkLink;
    public toolPhase: toolPhase | null = null;
    public toolHelpHeader = 'Luo uusi linkki';
    public toolHelpText =
        'Valitse kartalta ensin linkin alkusolmu, jonka jälkeen valitse linkin loppusolmu.';
    private startNodeId: string | null = null;
    private endNodeId: string | null = null;

    public activate = () => {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.unusedNode);
        NetworkStore.showMapLayer(MapLayer.link);
        NetworkStore.showMapLayer(MapLayer.unusedLink);
        EventListener.on('nodeClick', this.onNodeClick);
        EventListener.on('networkNodeClick', this.onNodeClick);
    };

    public deactivate = () => {
        this.resetTool();
        EventListener.off('nodeClick', this.onNodeClick);
        EventListener.off('networkNodeClick', this.onNodeClick);
    };

    public setToolPhase = (toolPhase: toolPhase | null) => {
        this.toolPhase = toolPhase;
    };

    private onNodeClick = async (clickEvent: CustomEvent) => {
        const params: INodeClickParams = clickEvent.detail;
        this.setStartOrEndNode(params.nodeId);
    };

    private setStartOrEndNode = async (nodeId: string) => {
        if (!this.startNodeId) {
            this.startNodeId = nodeId;
            try {
                const startNode = await NodeService.fetchNode(nodeId);
                LinkStore.setMarkerCoordinates(startNode!.coordinates);
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
        navigator.goTo({ link: newLinkViewLink });
        ToolbarStore.selectTool(null);
    };

    private resetTool = () => {
        this.startNodeId = null;
        this.endNodeId = null;
        LinkStore.setMarkerCoordinates(null);
    };
}

export default AddNetworkLinkTool;
