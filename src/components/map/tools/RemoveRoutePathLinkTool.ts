import ToolbarToolType from '~/enums/toolbarToolType';
import EventListener, { IRoutePathLinkClickParams } from '~/helpers/EventListener';
import RoutePathStore from '~/stores/routePathStore';
import ToolbarStore from '~/stores/toolbarStore';
import BaseTool from './BaseTool';

type toolPhase = 'selectRoutePathLinkToRemove';

/**
 * Tool for remove routepath link
 */
class RemoveRoutePathLinkTool implements BaseTool {
    public toolType = ToolbarToolType.RemoveRoutePathLink;
    public toolHelpHeader = 'Poista reitin linkki';
    public toolHelpPhasesMap = {
        selectRoutePathLinkToRemove: {
            phaseHelpText: 'Poista reitin linkki klikkaamalla sitä kartalta tai sivupalkista.',
        },
    };

    public activate = () => {
        RoutePathStore.setIsEditingDisabled(false);
        EventListener.on('routePathLinkClick', this.onRoutePathLinkClick);
        this.setToolPhase('selectRoutePathLinkToRemove');
    };

    public deactivate = () => {
        this.setToolPhase(null);
        EventListener.off('routePathLinkClick', this.onRoutePathLinkClick);
    };

    public getToolPhase = () => {
        return ToolbarStore.toolPhase;
    };

    public setToolPhase = (toolPhase: toolPhase | null) => {
        ToolbarStore.setToolPhase(toolPhase);
    };

    private onRoutePathLinkClick = (clickEvent: CustomEvent) => {
        const params: IRoutePathLinkClickParams = clickEvent.detail;
        RoutePathStore.removeLink(params.routePathLinkId);
    };
}

export default RemoveRoutePathLinkTool;
