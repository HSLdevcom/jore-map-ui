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
        this.reset();
    }

    private reset() {
        RoutePathStore.setNeighborRoutePathLinks([]);
    }

    private setInteractiveNode = async (nodeId: string, addAfter: boolean, orderNumber: number) => {
        const routePathLinks =
            await RoutePathLinkService.fetchAndCreateRoutePathLinksWithNodeId(
                nodeId,
                addAfter,
                orderNumber);
        if (routePathLinks.length === 0) {
            NotificationStore!.addNotification({
                message:
                    `Tästä solmusta (soltunnus: ${nodeId}) alkavaa linkkiä ei löytynyt.`, // tslint:disable
                type: NotificationType.ERROR,
            });
        } else {
            RoutePathStore!.setNeighborRoutePathLinksAreGoingForward(addAfter);
            RoutePathStore!.setNeighborRoutePathLinks(routePathLinks);
        }
    }

    public onNetworkNodeClick = async (clickEvent: any) => {
        if (!this.isNetworkNodesInteractive()) return;

        const properties =  clickEvent.sourceTarget.properties;
        if (properties.soltyyppi !== NodeType.STOP) return;

        await this.setInteractiveNode(properties.soltunnus, true,  0);
    }

    public onNodeClick = (node: INode, previousRPLink?: IRoutePathLink, nextRPLink?: IRoutePathLink) => async () => {
        console.log(previousRPLink);
        const shouldAddLinkAfterNode = previousRPLink ? true : false;
        const newOrderNumber = previousRPLink ? previousRPLink!.orderNumber + 1 : nextRPLink!.orderNumber - 1;
        await this.setInteractiveNode(node.id, shouldAddLinkAfterNode, newOrderNumber);
    }

    private isNetworkNodesInteractive() {
        const hasRoutePathLinks =
            RoutePathStore!.routePath &&
            RoutePathStore!.routePath!.routePathLinks!.length === 0;

        return RoutePathStore!.isCreating && hasRoutePathLinks;
    }
}

export default AddNewRoutePathLinkTool;
