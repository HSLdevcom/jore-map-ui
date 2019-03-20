import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import { INode } from '~/models';
import ToolbarTool from '~/enums/toolbarTool';
import NodeService from '~/services/nodeService';
import ErrorStore from '~/stores/errorStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import ToolbarStore from '~/stores/toolbarStore';
import RoutePathStore from '~/stores/routePathStore';
import LinkFactory from '~/factories/linkFactory';
import LinkStore from '~/stores/linkStore';
import BaseTool from './BaseTool';

class AddNetworkLinkTool implements BaseTool {
    private startNode: INode | null;
    public toolType = ToolbarTool.AddNetworkLink;
    public toolHelpHeader = 'Luo uusi linkki';
    public toolHelpText = 'Valitse kartalta ensin linkin alkusolmu, jonka jälkeen valitse linkin loppusolmu.'; // tslint:disable-line max-line-length
    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
    }
    public deactivate() {}
    public onNetworkNodeClick = async (clickEvent: any) => {
        const nodeId = clickEvent.sourceTarget.properties.soltunnus;
        if (!this.startNode) {
            this.startNode = await NodeService.fetchNode(nodeId);
            LinkStore.setStartMarkerCoordinates(this.startNode.coordinates);
        } else {
            const endNodeId = nodeId;
            try {
                const endNode = await NodeService.fetchNode(endNodeId);
                this.createNewLink(this.startNode, endNode);
                this.startNode = null;
                LinkStore.setStartMarkerCoordinates(null);
            } catch (ex) {
                ErrorStore.addError(`Alkusolmun ${this.startNode!.id} tai loppusolmun ${endNodeId} haku epäonnistui`); // tslint:disable-line max-line-length
                return;
            }
            const newLinkViewLink = routeBuilder
                .to(SubSites.newLink)
                .toLink();
            navigator.goTo(newLinkViewLink);
        }
    }

    private createNewLink = (startNode: INode, endNode: INode) => {
        ToolbarStore.selectTool(null);
        RoutePathStore.clear();
        const link = LinkFactory.createNewLink(startNode, endNode);
        LinkStore.init(link, [startNode, endNode]);
    }
}

export default AddNetworkLinkTool;
