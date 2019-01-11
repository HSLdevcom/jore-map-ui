import ToolbarTool from '~/enums/toolbarTool';
import RoutePathStore from '~/stores/routePathStore';
import BaseTool from './BaseTool';

/**
 * Tool for remove routepath link
 */
class RemoveRoutePathLinkTool implements BaseTool {
    public toolType = ToolbarTool.RemoveRoutePathLink;
    public activate() {}
    public deactivate() {}

    public onRoutePathLinkClick = (id: string) => async (clickEvent: any) => {
        RoutePathStore.removeLink(id);
    }
}

export default RemoveRoutePathLinkTool;
