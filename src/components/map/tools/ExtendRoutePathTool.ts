import RoutePathStore from '~/stores/routePathStore';
import NodeType from '~/enums/nodeType';
import ToolbarTool from '~/enums/toolbarTool';
import ErrorStore from '~/stores/errorStore';
import { INode } from '~/models';
import RoutePathLinkService from '~/services/routePathLinkService';
import BaseTool from './BaseTool';

/**
 * Tool for creating new routePath
 */
class ExtendRoutePathTool implements BaseTool {
    public toolType = ToolbarTool.AddNewRoutePathLink;
    public toolHelpHeader = 'Laajenna reitinsuuntaa';
    public toolHelpText = 'Valitse kartalta ensin aloitus-solmu. Tämän jälkeen jatka reitinsuunnan laajentamista liilaksi merkittyjä linkkejä tai solmuja klikkailemalla.'; // tslint:disable-line max-line-length
    public activate() {}
    public deactivate() {
        this.reset();
    }

    private reset() {
        RoutePathStore.setNeighborRoutePathLinks([]);
    }

    public onNetworkNodeClick = async (clickEvent: any) => {
        try {
            if (!this.isNetworkNodesInteractive()) return;

            const properties = clickEvent.sourceTarget.properties;
            if (properties.soltyyppi !== NodeType.STOP) return;
            const queryResult =
                await RoutePathLinkService.fetchNeighborRoutePathLinks(
                    properties.soltunnus,
                    1,
                    RoutePathStore!.routePath!.transitType,
                    RoutePathStore!.routePath!.routePathLinks,
                );
            RoutePathStore!.setNeighborRoutePathLinks(queryResult!.routePathLinks);
            RoutePathStore!.setNeighborToAddType(queryResult!.neighborToAddType);

        } catch (ex) {
            ErrorStore.addError(
                'Unable to process network node click using ExtendRoutePathTool', ex);
        }
    }

    public onNodeClick = (node: INode, linkOrderNumber: number) => async () => {
        const queryResult =
            await RoutePathLinkService.fetchNeighborRoutePathLinks(
                node.id,
                linkOrderNumber,
                RoutePathStore!.routePath!.transitType,
                RoutePathStore!.routePath!.routePathLinks,
            );
        RoutePathStore!.setNeighborRoutePathLinks(queryResult!.routePathLinks);
        RoutePathStore!.setNeighborToAddType(queryResult!.neighborToAddType);
    }

    private isNetworkNodesInteractive() {
        return RoutePathStore!.routePath &&
            RoutePathStore!.routePath!.routePathLinks!.length === 0;
    }
}

export default ExtendRoutePathTool;
