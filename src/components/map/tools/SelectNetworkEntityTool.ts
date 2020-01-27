import { LatLng } from 'leaflet';
import constants from '~/constants/constants';
import ToolbarTool from '~/enums/toolbarTool';
import { ILinkMapHighlight } from '~/models/ILink';
import { INodeMapHighlight } from '~/models/INode';
import navigator from '~/routing/navigator';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import LinkService from '~/services/linkService';
import NodeService from '~/services/nodeService';
import MapStore from '~/stores/mapStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import PopupStore, { IPopupProps } from '~/stores/popupStore';
import EventManager from '~/utils/EventManager';
import { isNetworkElementHidden, isNetworkNodeHidden } from '~/utils/networkUtils';
import { ISelectNetworkEntityPopupData } from '../layers/popups/SelectNetworkEntityPopup';
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
        const zoomLevel = MapStore.zoom;
        if (zoomLevel <= constants.MAP_LAYERS_MIN_ZOOM_LEVEL) {
            return;
        }
        if (
            !NetworkStore!.isMapLayerVisible(MapLayer.node) &&
            !NetworkStore!.isMapLayerVisible(MapLayer.link)
        ) {
            return;
        }

        const leafletLatLng = clickEvent.detail.latlng as LatLng;
        const latLng = new LatLng(leafletLatLng.lng, leafletLatLng.lat);

        // TODO: fix these hard coded values to use pixel count per meter (that depend on map's zoom level) instead
        let bufferSize;
        switch (zoomLevel) {
            case 14:
                bufferSize = 0.00046;
                break;
            case 15:
                bufferSize = 0.00035;
                break;
            case 16:
                bufferSize = 0.00026;
                break;
            case 17:
                bufferSize = 0.00019;
                break;
            case 18:
                bufferSize = 0.00013;
                break;
            case 19:
                bufferSize = 0.00008;
                break;
            case 20:
                bufferSize = 0.00004;
                break;
            case 21:
                bufferSize = 0.00001;
                break;
            default:
                bufferSize = 0.00025;
                break;
        }

        let nodes: INodeMapHighlight[] = await NodeService.fetchMapHighlightNodesFromLatLng(
            latLng,
            bufferSize
        );
        nodes = nodes.filter(
            (node: INodeMapHighlight) =>
                !isNetworkNodeHidden({
                    nodeId: node.id,
                    transitTypeCodes: node.transitTypes.join(','),
                    dateRangesString: node.dateRanges
                })
        );

        let links: ILinkMapHighlight[] = await LinkService.fetchMapHighlightLinksFromLatLng(
            latLng,
            bufferSize
        );
        links = links.filter(
            (link: ILinkMapHighlight) =>
                !isNetworkElementHidden({
                    type: MapLayer.link,
                    transitType: link.transitType,
                    startNodeId: link.startNodeId,
                    endNodeId: link.endNodeId,
                    dateRangesString: link.dateRanges
                })
        );

        if (nodes.length === 0 && links.length === 0) return;
        if (nodes.length === 1 && links.length === 0) {
            _redirectToNode(nodes[0]);
            return;
        }
        if (links.length === 1 && nodes.length === 0) {
            _redirectToLink(links[0]);
            return;
        }

        const popupData: ISelectNetworkEntityPopupData = {
            nodes,
            links
        };
        const popup: IPopupProps = {
            type: 'selectNetworkEntityPopup',
            data: popupData,
            coordinates: leafletLatLng,
            isCloseButtonVisible: true,
            isAutoCloseOn: false,
            hasOpacity: true
        };
        PopupStore.showPopup(popup);
    };
}

const _redirectToNode = (node: INodeMapHighlight) => {
    const nodeViewLink = routeBuilder
        .to(SubSites.node)
        .toTarget(':id', node.id)
        .toLink();
    navigator.goTo({
        link: nodeViewLink,
        unsavedChangesPromptMessage: `Sinulla on tallentamattomia muutoksia. Haluatko varmasti avata solmun ${
            node.id
        }? Tallentamattomat muutokset kumotaan.`
    });
};

const _redirectToLink = (link: ILinkMapHighlight) => {
    const linkViewLink = routeBuilder
        .to(SubSites.link)
        .toTarget(':id', [link.startNodeId, link.endNodeId, link.transitType].join(','))
        .toLink();
    navigator.goTo({
        link: linkViewLink,
        unsavedChangesPromptMessage: `Sinulla on tallentamattomia muutoksia. Haluatko varmasti avata linkin? Tallentamattomat muutokset kumotaan.`
    });
};

export default SelectNetworkEntityTool;
