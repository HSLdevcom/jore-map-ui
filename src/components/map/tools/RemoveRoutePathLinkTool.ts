import ToolbarToolType from '~/enums/toolbarToolType';
import RoutePathStore from '~/stores/routePathStore';
import BaseTool from './BaseTool';

/**
 * Tool for remove routepath link
 */
class RemoveRoutePathLinkTool implements BaseTool {
    public toolType = ToolbarToolType.RemoveRoutePathLink;
    public toolHelpHeader = 'Poista reitin linkki';
    public toolHelpText = 'Poista reitin linkki klikkaamalla sitä kartalta.';
    public activate() {
        RoutePathStore.setIsEditingDisabled(false);
    }
    public deactivate() {}

    public onRoutePathLinkClick = (id: string) => (clickEvent: any) => {
        RoutePathStore.removeLink(id);
    };
}

export default RemoveRoutePathLinkTool;
