import ToolbarTool from '~/enums/toolbarTool';
import NodeFactory from '~/factories/nodeFactory';
import navigator from '~/routing/navigator';
import EventManager from '~/util/EventManager';
import SubSites from '~/routing/subSites';
import RoutePathStore from '~/stores/routePathStore';
import MapStore from '~/stores/mapStore';
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
        MapStore.setMapCursor('crosshair');
    }
    public deactivate() {
        EventManager.off('mapClick', this.onMapClick);
        MapStore.setMapCursor('');
    }
    private onMapClick = async (clickEvent: CustomEvent) => {
        ToolbarStore.selectTool(null);
        RoutePathStore.clear();
        const newNode = NodeFactory.createNewNode(clickEvent.detail.latlng);
        NodeStore.init(newNode, []);
        navigator.goTo(SubSites.newNode);
    }
}

export default AddNetworkNodeTool;
