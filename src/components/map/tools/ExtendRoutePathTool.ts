import RoutePathStore from '~/stores/routePathStore';
import NodeType from '~/enums/nodeType';
import ToolbarTool from '~/enums/toolbarTool';
import EventManager from '~/util/EventManager';
import RoutePathNeighborLinkService from '~/services/routePathNeighborLinkService';
import BaseTool from './BaseTool';
import { IEditRoutePathLayerNodeClickParams } from '../layers/edit/UpsertRoutePathLayer';
import { NetworkNodeClickParams } from '../layers/NetworkLayers';

/**
 * Tool for creating new routePath
 */
class ExtendRoutePathTool implements BaseTool {
    public toolType = ToolbarTool.AddNewRoutePathLink;
    public toolHelpHeader = 'Laajenna reitinsuuntaa';
    public toolHelpText =
        'Valitse kartalta ensin aloitus-solmu. Tämän jälkeen jatka reitinsuunnan laajentamista liilaksi merkittyjä linkkejä tai solmuja klikkailemalla.'; // tslint:disable-line max-line-length
    public activate() {
        EventManager.on('networkNodeClick', this.onNetworkNodeClick);
        EventManager.on('nodeClick', this.onNodeClick);
    }
    public deactivate() {
        this.reset();
        EventManager.off('networkNodeClick', this.onNetworkNodeClick);
        EventManager.off('nodeClick', this.onNodeClick);
    }

    private reset() {
        RoutePathStore.setNeighborRoutePathLinks([]);
    }

    private onNetworkNodeClick = async (clickEvent: CustomEvent) => {
        if (!this.isNetworkNodesInteractive()) return;
        const params: NetworkNodeClickParams = clickEvent.detail;
        if (params.nodeType !== NodeType.STOP) return;
        const queryResult = await RoutePathNeighborLinkService.fetchNeighborRoutePathLinks(
            params.nodeId,
            RoutePathStore.routePath!,
            1
        );
        if (queryResult) {
            RoutePathStore!.setNeighborRoutePathLinks(
                queryResult!.neighborLinks
            );
            RoutePathStore!.setNeighborToAddType(
                queryResult!.neighborToAddType
            );
        }
    };

    private onNodeClick = async (clickEvent: CustomEvent) => {
        const params: IEditRoutePathLayerNodeClickParams = clickEvent.detail;
        const node = params.node;
        const linkOrderNumber = params.linkOrderNumber;
        const queryResult = await RoutePathNeighborLinkService.fetchNeighborRoutePathLinks(
            node.id,
            RoutePathStore!.routePath!,
            linkOrderNumber
        );
        if (queryResult) {
            RoutePathStore!.setNeighborRoutePathLinks(
                queryResult.neighborLinks
            );
            RoutePathStore!.setNeighborToAddType(queryResult.neighborToAddType);
        }
    };

    private isNetworkNodesInteractive() {
        return (
            RoutePathStore!.routePath &&
            RoutePathStore!.routePath!.routePathLinks!.length === 0
        );
    }
}

export default ExtendRoutePathTool;
