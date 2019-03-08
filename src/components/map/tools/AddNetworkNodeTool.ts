import ToolbarTool from '~/enums/toolbarTool';
import NodeFactory from '~/factories/nodeFactory';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import NodeStore from '~/stores/nodeStore';
import ToolbarStore from '~/stores/toolbarStore';
import BaseTool from './BaseTool';

class AddNetworkNodeTool implements BaseTool {
    public toolType = ToolbarTool.AddNetworkNode;
    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);

        document.addEventListener('mapClick', this.onMapClick);
    }
    public deactivate() {
        document.removeEventListener('mapClick', this.onMapClick);
    }
    private onMapClick = async (clickEvent: CustomEvent) => {
        ToolbarStore.selectTool(null);
        const newNode = NodeFactory.createNewNode(clickEvent.detail.latlng);
        NodeStore.init(newNode, []);
        navigator.goTo(SubSites.newNode);
    }
}

export default AddNetworkNodeTool;
