import RoutePathStore from '~/stores/routePathStore';
import NotificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import NodeType from '~/enums/nodeType';
import RoutePathLinkService from '~/services/routePathLinkService';
import ToolbarTool from '~/enums/toolbarTool';
import BaseTool from './BaseTool';

/**
 * Tool for creating new routePath
 */
export default class AddNewRoutePathTool implements BaseTool {
    public toolType = ToolbarTool.AddNewRoutePath;
    public activate() {}
    public deactivate() {}

    public isNetworkNodesInteractive() {
        const hasRoutePathLinks =
        RoutePathStore!.routePath &&
        RoutePathStore!.routePath!.routePathLinks!.length === 0;

        return RoutePathStore!.isCreating && hasRoutePathLinks;
    }

    public onNetworkNodeClick = async (clickEvent: any) => {
        if (!this.isNetworkNodesInteractive()) return;
        const properties =  clickEvent.sourceTarget.properties;
        if (properties.soltyyppi !== NodeType.STOP) return;

        const routePathLinks =
            await RoutePathLinkService.fetchAndCreateRoutePathLinksWithStartNodeId(
                properties.soltunnus);
        if (routePathLinks.length === 0) {
            NotificationStore!.addNotification({
                message:
                    `Tästä solmusta (soltunnus: ${properties.soltunnus}) alkavaa linkkiä ei löytynyt.`, // tslint:disable
                type: NotificationType.ERROR,
            });
        } else {
            RoutePathStore!.setNeighborRoutePathLinks(routePathLinks);
        }
    }
}
