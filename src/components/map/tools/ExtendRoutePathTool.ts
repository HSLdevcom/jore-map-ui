import RoutePathStore from '~/stores/routePathStore';
import NodeType from '~/enums/nodeType';
import ToolbarTool from '~/enums/toolbarTool';
import EventManager from '~/util/EventManager';
import { INode } from '~/models';
import RoutePathLinkService from '~/services/routePathLinkService';
import BaseTool from './BaseTool';

export interface IExtendRoutePathNodeClickParams {
    node: INode;
    linkOrderNumber: number;
}

export interface IExtendRoutePathNetworkClickParams {
    nodeId: string;
    nodeType: NodeType;
}

/**
 * Tool for creating new routePath
 */
class ExtendRoutePathTool implements BaseTool {
    public toolType = ToolbarTool.AddNewRoutePathLink;
    public toolHelpHeader = 'Laajenna reitinsuuntaa';
    public toolHelpText = 'Valitse kartalta ensin aloitus-solmu. Tämän jälkeen jatka reitinsuunnan laajentamista liilaksi merkittyjä linkkejä tai solmuja klikkailemalla.'; // tslint:disable-line max-line-length
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
        const params: IExtendRoutePathNetworkClickParams = clickEvent.detail;
        if (params.nodeType !== NodeType.STOP) return;
        const queryResult =
            await RoutePathLinkService.fetchNeighborRoutePathLinks(
                params.nodeId,
                1,
                RoutePathStore!.routePath!.transitType,
                RoutePathStore!.routePath!.routePathLinks,
            );
        if (queryResult) {
            RoutePathStore!.setNeighborRoutePathLinks(queryResult!.routePathLinks);
            RoutePathStore!.setNeighborToAddType(queryResult!.neighborToAddType);
        }
    }

    private onNodeClick = async (clickEvent: CustomEvent) => {
        const params: IExtendRoutePathNodeClickParams = clickEvent.detail;
        const node = params.node;
        const linkOrderNumber = params.linkOrderNumber;
        const queryResult =
            await RoutePathLinkService.fetchNeighborRoutePathLinks(
                node.id,
                linkOrderNumber,
                RoutePathStore!.routePath!.transitType,
                RoutePathStore!.routePath!.routePathLinks,
            );
        if (queryResult) {
            RoutePathStore!.setNeighborRoutePathLinks(queryResult.routePathLinks);
            RoutePathStore!.setNeighborToAddType(queryResult.neighborToAddType);
        }
    }

    private isNetworkNodesInteractive() {
        return RoutePathStore!.routePath &&
            RoutePathStore!.routePath!.routePathLinks!.length === 0;
    }
}

export default ExtendRoutePathTool;
