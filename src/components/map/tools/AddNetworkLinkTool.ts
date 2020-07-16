import ToolbarToolType from '~/enums/toolbarToolType';
import EventHelper, { INodeClickParams } from '~/helpers/EventHelper';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import NodeService from '~/services/nodeService';
import ErrorStore from '~/stores/errorStore';
import LinkStore from '~/stores/linkStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import ToolbarStore from '~/stores/toolbarStore';
import BaseTool from './BaseTool';

class AddNetworkLinkTool implements BaseTool {
    private startNodeId: string | null = null;
    private endNodeId: string | null = null;
    public toolType = ToolbarToolType.AddNetworkLink;
    public toolHelpHeader = 'Luo uusi linkki';
    public toolHelpText =
        'Valitse kartalta ensin linkin alkusolmu, jonka jälkeen valitse linkin loppusolmu.';
    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.unusedNode);
        NetworkStore.showMapLayer(MapLayer.link);
        NetworkStore.showMapLayer(MapLayer.unusedLink);
        EventHelper.on('nodeClick', this.onNodeClick);
        EventHelper.on('networkNodeClick', this.onNodeClick);
    }
    public deactivate() {
        this.resetTool();
        EventHelper.off('nodeClick', this.onNodeClick);
        EventHelper.off('networkNodeClick', this.onNodeClick);
    }
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
