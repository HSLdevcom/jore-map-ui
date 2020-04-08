import ToolbarToolType from '~/enums/toolbarToolType';
import EventHelper from '~/helpers/EventHelper';
import navigator from '~/routing/navigator';
import RouteBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import MapStore from '~/stores/mapStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import ToolbarStore from '~/stores/toolbarStore';
import { roundLatLng } from '~/utils/geomUtils';
import BaseTool from './BaseTool';

class AddNetworkNodeTool implements BaseTool {
    public toolType = ToolbarToolType.AddNetworkNode;
    public toolHelpHeader = 'Luo uusi solmu';
    public toolHelpText = 'Aloita uuden solmun luonti valitsemalla solmulle sijainti kartalta.';

    public activate() {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventHelper.on('mapClick', this.onMapClick);
        MapStore.setMapCursor('crosshair');
    }

    public deactivate() {
        EventHelper.off('mapClick', this.onMapClick);
        MapStore.setMapCursor('');
    }

    private onMapClick = async (clickEvent: CustomEvent) => {
        ToolbarStore.selectTool(null);
        const coordinate = roundLatLng(clickEvent.detail.latlng);
        const newNodeViewLink = RouteBuilder.to(SubSites.newNode)
            .toTarget(':id', `${coordinate.lat}:${coordinate.lng}`)
            .toLink();
        navigator.goTo({ link: newNodeViewLink });
    };
}

export default AddNetworkNodeTool;
