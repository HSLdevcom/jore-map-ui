import ToolbarTool from '~/enums/toolbarTool';
import NodeFactory from '~/factories/nodeFactory';
import navigator from '~/routing/navigator';
import EventManager from '~/util/EventManager';
import SubSites from '~/routing/subSites';
import RoutePathStore from '~/stores/routePathStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import NodeStore from '~/stores/nodeStore';
import ToolbarStore from '~/stores/toolbarStore';
import BaseTool from './BaseTool';

class AddNetworkNodeTool implements BaseTool {
    public toolType = ToolbarTool.AddNetworkNode;
    public toolHelpHeader = 'Luo uusi solmu';
    public toolHelpText = 'Aloita uuden solmun luonti valitsemalla solmulle sijainti kartalta.'; // tslint:disable-line max-line-length
    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventManager.on('mapClick', this.onMapClick);
    }
    public deactivate() {
        EventManager.off('mapClick', this.onMapClick);
    }
    private onMapClick = async (clickEvent: CustomEvent) => {
        ToolbarStore.selectTool(null);
        navigator.goTo(SubSites.newNode);
        RoutePathStore.clear();
        const newNode = NodeFactory.createNewNode(clickEvent.detail.latlng);
        NodeStore.init(newNode, []);
    }
}

export default AddNetworkNodeTool;
