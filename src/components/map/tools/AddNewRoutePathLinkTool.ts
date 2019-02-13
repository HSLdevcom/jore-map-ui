import RoutePathStore, { AddLinkDirection, AddRoutePathLinkState } from '~/stores/routePathStore';
import NodeType from '~/enums/nodeType';
import ToolbarTool from '~/enums/toolbarTool';
import ErrorStore from '~/stores/errorStore';
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
            try {
                const routePathLinks =
                await RoutePathLinkService.fetchAndCreateRoutePathLinksWithNodeId(
                    nodeId,
                    direction,
                    orderNumber,
                    RoutePathStore.routePath!.transitType);
                if (routePathLinks.length === 0) {
                    // tslint:disable-next-line:max-line-length
                    ErrorStore.addError(`Tästä solmusta (soltunnus: ${nodeId}) alkavaa linkkiä ei löytynyt.`);
                } else {
                    RoutePathStore!.setNeighborRoutePathLinks(routePathLinks);
                }
            } catch (ex) {
                ErrorStore.addError('Haku löytää sopivia naapurisolmuja epäonnistui');
            }
        }

    public onNetworkNodeClick = async (clickEvent: any) => {
        try {
            if (!this.isNetworkNodesInteractive()) return;

            const properties =  clickEvent.sourceTarget.properties;
            if (properties.soltyyppi !== NodeType.STOP) return;
            RoutePathStore.setAddRoutePathLinkDirection(AddLinkDirection.AfterNode);
            await this.setInteractiveNode(properties.soltunnus, AddLinkDirection.AfterNode,  1);

        } catch (e) {
            ErrorStore.addError((e as Error).message);
        }
    }

    public onNodeClick = (
        node: INode,
        previousRPLink?: IRoutePathLink,
        nextRPLink?: IRoutePathLink,
    ) => async () => {
        const linkDirection =
            previousRPLink ?
            AddLinkDirection.AfterNode :
            AddLinkDirection.BeforeNode;
        RoutePathStore.setAddRoutePathLinkDirection(linkDirection);
        const newOrderNumber =
            linkDirection === AddLinkDirection.AfterNode
            ? previousRPLink!.orderNumber + 1
            : nextRPLink!.orderNumber;
        await this.setInteractiveNode(node.id, linkDirection, newOrderNumber);
    }

    private isNetworkNodesInteractive() {
        return RoutePathStore!.routePath &&
            RoutePathStore!.routePath!.routePathLinks!.length === 0;
    }

    public isNodeHighlighted = (node: INode) => {
        return RoutePathStore.addRoutePathLinkInfo.state
            === AddRoutePathLinkState.SetTargetLocation &&
            RoutePathStore!.isRoutePathNodeMissingNeighbour(node);
    }
}

export default AddNewRoutePathLinkTool;
