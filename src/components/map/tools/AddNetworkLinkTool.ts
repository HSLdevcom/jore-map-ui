import ToolbarToolType from '~/enums/toolbarToolType';
import EventHelper, { INetworkNodeClickParams, INodeClickParams } from '~/helpers/EventHelper';
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
        NetworkStore.showMapLayer(MapLayer.nodeWithoutLink);
        NetworkStore.showMapLayer(MapLayer.link);
        EventHelper.on('nodeClick', this.onNodeClick);
        EventHelper.on('networkNodeClick', this.onNetworkNodeClick);
    }
    public deactivate() {
        this.resetTool();
        EventHelper.off('nodeClick', this.onNodeClick);
        EventHelper.off('networkNodeClick', this.onNetworkNodeClick);
    }
    private onNodeClick = async (clickEvent: CustomEvent) => {
        const nodeClickParams: INodeClickParams = clickEvent.detail;
        this.setStartOrEndNode(nodeClickParams.node.id);
    };

    private onNetworkNodeClick = async (clickEvent: CustomEvent) => {
        const networkNodeClickParams: INetworkNodeClickParams = clickEvent.detail;
        this.setStartOrEndNode(networkNodeClickParams.nodeId);
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
