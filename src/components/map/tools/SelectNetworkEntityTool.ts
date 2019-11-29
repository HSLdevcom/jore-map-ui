import { LatLng } from 'leaflet';
import ToolbarTool from '~/enums/toolbarTool';
import { INodeMapHighlight } from '~/models/INode';
import NodeService from '~/services/nodeService';
import PopupStore, { IPopupProps } from '~/stores/popupStore';
import EventManager from '~/util/EventManager';
import BaseTool from './BaseTool';

class SelectNetworkEntityTool implements BaseTool {
    public toolType = ToolbarTool.SelectNetworkEntity;
    public activate() {
        EventManager.on('mapClick', this.onMapClick);
    }
    public deactivate() {
        EventManager.off('mapClick', this.onMapClick);
    }

    private onMapClick = async (clickEvent: any) => {
        const leafletLatLng = clickEvent.detail.latlng as LatLng;
        const latLng = new LatLng(leafletLatLng.lng, leafletLatLng.lat);
        const nodes: INodeMapHighlight[] = await NodeService.fetchNodesFromLatLng(latLng);
        if (nodes.length === 0) return;

        const nodePopup: IPopupProps = {
            type: 'selectNetworkEntityPopup',
            data: nodes,
            coordinates: leafletLatLng,
            isCloseButtonVisible: false,
            isAutoCloseOn: false,
            hasOpacity: true
        };
        PopupStore.showPopup(nodePopup);
    };

    // private onNetworkLinkClick = async (clickEvent: CustomEvent) => {
    //     const params: INetworkLinkClickParams = clickEvent.detail;

    //     const linkViewLink = routeBuilder
    //         .to(SubSites.link)
    //         .toTarget(':id', [params.startNodeId, params.endNodeId, params.transitType].join(','))
    //         .toLink();
    //     navigator.goTo(linkViewLink);
    // };
}

export default SelectNetworkEntityTool;
