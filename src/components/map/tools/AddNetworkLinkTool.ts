import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import ToolbarTool from '~/enums/toolbarTool';
import NodeService from '~/services/nodeService';
import ErrorStore from '~/stores/errorStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import ToolbarStore from '~/stores/toolbarStore';
import LinkStore from '~/stores/linkStore';
import BaseTool from './BaseTool';

class AddNetworkLinkTool implements BaseTool {
    private startNodeId: string | null = null;
    public toolType = ToolbarTool.AddNetworkLink;
    public toolHelpHeader = 'Luo uusi linkki';
    public toolHelpText = 'Valitse kartalta ensin linkin alkusolmu, jonka jälkeen valitse linkin loppusolmu.'; // tslint:disable-line max-line-length
    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.nodeWithoutLink);
        NetworkStore.showMapLayer(MapLayer.link);
    }
    public deactivate() {
        this.resetTool();
    }
    public onNetworkNodeClick = async (clickEvent: any) => {
        const nodeId = clickEvent.sourceTarget.properties.soltunnus;
        if (!this.startNodeId) {
            this.startNodeId = nodeId;
            try {
                const startNode = await NodeService.fetchNode(nodeId);
                LinkStore.setStartMarkerCoordinates(startNode.coordinates);
            } catch (e) {
                ErrorStore.addError(`Alkusolmun ${nodeId} haku epäonnistui`);
            }
        } else {
            const startNodeId = this.startNodeId;
            const endNodeId = nodeId;

            const newLinkViewLink = routeBuilder
                .to(SubSites.newLink)
                .toTarget([
                    startNodeId,
                    endNodeId,
                ].join(','))
                .toLink();
            navigator.goTo(newLinkViewLink);

            ToolbarStore.selectTool(null);
        }
    }

    private resetTool = () => {
        this.startNodeId = null;
        LinkStore.setStartMarkerCoordinates(null);
    }
}

export default AddNetworkLinkTool;
