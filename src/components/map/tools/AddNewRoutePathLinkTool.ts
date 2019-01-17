import RoutePathStore from '~/stores/routePathStore';
import NotificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import NodeType from '~/enums/nodeType';
import ToolbarTool from '~/enums/toolbarTool';
import { INode, IRoutePathLink } from '~/models';
import RoutePathLinkService from '~/services/routePathLinkService';
import BaseTool from './BaseTool';

/**
 * Tool for creating new routePath
 */
class AddNewRoutePathLinkTool implements BaseTool {
    public toolType = ToolbarTool.AddNewRoutePathLink;
    public activate() {}
    public deactivate() {
        RoutePathStore.setNeighborRoutePathLinks([]);
    }

    private setInteractiveNode = async (nodeId: string, orderNumber: number) => {
        const routePathLinks =
            await RoutePathLinkService.fetchAndCreateRoutePathLinksWithStartNodeId(
                nodeId,
                orderNumber);
        if (routePathLinks.length === 0) {
            NotificationStore!.addNotification({
                message:
                    `Tästä solmusta (soltunnus: ${nodeId}) alkavaa linkkiä ei löytynyt.`, // tslint:disable
                type: NotificationType.ERROR,
            });
        } else {
            RoutePathStore!.setNeighborRoutePathLinks(routePathLinks);
        }
    }

    public onNetworkNodeClick = async (clickEvent: any) => {
        if (!this.isNetworkNodesInteractive()) return;

        const properties =  clickEvent.sourceTarget.properties;
        if (properties.soltyyppi !== NodeType.STOP) return;

        await this.setInteractiveNode(properties.soltyyppi, 0);
    }

    public onNodeClick = (node: INode, previousRPLink: IRoutePathLink) => async () => {
        if (previousRPLink) {
            await this.setInteractiveNode(node.id, previousRPLink!.orderNumber + 1);
        }
    }

    private isNetworkNodesInteractive() {
        const hasRoutePathLinks =
            RoutePathStore!.routePath &&
            RoutePathStore!.routePath!.routePathLinks!.length === 0;

        return RoutePathStore!.isCreating && hasRoutePathLinks;
    }
}

export default AddNewRoutePathLinkTool;
