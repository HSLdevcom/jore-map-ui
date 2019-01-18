import RoutePathStore, { AddLinkDirection } from '~/stores/routePathStore';
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

    private setInteractiveNode =
        async (nodeId: string, direction: AddLinkDirection, orderNumber: number) => {
            const routePathLinks =
                await RoutePathLinkService.fetchAndCreateRoutePathLinksWithNodeId(
                    nodeId,
                    direction,
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

        RoutePathStore.setAddRoutePathLinkDirection(AddLinkDirection.AfterNode);
        await this.setInteractiveNode(properties.soltunnus, AddLinkDirection.AfterNode,  0);
    }

    public onNodeClick = (node: INode, previousRPLink?: IRoutePathLink, nextRPLink?: IRoutePathLink) => async () => {
        const linkDirection = previousRPLink ? AddLinkDirection.AfterNode : AddLinkDirection.BeforeNode;
        RoutePathStore.setAddRoutePathLinkDirection(linkDirection);
        const newOrderNumber =
            linkDirection === AddLinkDirection.AfterNode
            ? previousRPLink!.orderNumber + 1
            : nextRPLink!.orderNumber;
        await this.setInteractiveNode(node.id, linkDirection, newOrderNumber);
    }

    private isNetworkNodesInteractive() {
        const hasRoutePathLinks =
            RoutePathStore!.routePath &&
            RoutePathStore!.routePath!.routePathLinks!.length === 0;

        return RoutePathStore!.isCreating && hasRoutePathLinks;
    }
}

export default AddNewRoutePathLinkTool;
