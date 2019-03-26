import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import EventManager from '~/util/EventManager';
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
        EventManager.on('nodeClick', this.onNodeClick);
        EventManager.on('networkNodeClick', this.onNodeClick);
    }
    public deactivate() {
        this.resetTool();
        EventManager.off('nodeClick', this.onNodeClick);
        EventManager.off('networkNodeClick', this.onNodeClick);
    }
    private onNodeClick = async (clickEvent: CustomEvent) => {
        const nodeId = clickEvent.detail.nodeId;
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
            if (startNodeId === endNodeId) return;
            // TODO?
            // if (!this.isNewLinkValid(clickEvent, startNodeId, endNodeId)) return;

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

    // TODO?
    // If there is a link opened
    // * the new link has to start from where current link ends
    // * the new link has to end where the current link starts
    // private isNewLinkValid =
    // (clickEvent: CustomEvent, startNodeId: string, endNodeId: string) => {
    //     const currentLink = LinkStore.link;
    //     if (!currentLink) return true;
    //     if (clickEvent.type === 'nodeClick') {
    //         TODO: throw error if true
    //         if (currentLink.endNode.id === startNodeId) return true;
    //         if (currentLink.startNode.id === endNodeId) return true;
    //         return false;
    //     }
    //     return true;
    // }

    private resetTool = () => {
        this.startNodeId = null;
        LinkStore.setStartMarkerCoordinates(null);
    }
}

export default AddNetworkLinkTool;
