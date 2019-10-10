import ToolbarTool from '~/enums/toolbarTool';
import EventManager, {
    INetworkNodeClickParams,
    INetworkLinkClickParams
} from '~/util/EventManager';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import BaseTool from './BaseTool';

/**
 * Tool for creating new routePath
 */
class SelectNetworkEntityTool implements BaseTool {
    public toolType = ToolbarTool.SelectNetworkEntity;
    public activate() {
        EventManager.on('networkNodeClick', this.onNetworkNodeClick);
        EventManager.on('networkLinkClick', this.onNetworkLinkClick);
    }
    public deactivate() {
        EventManager.off('networkNodeClick', this.onNetworkNodeClick);
        EventManager.off('networkLinkClick', this.onNetworkLinkClick);
    }

    private onNetworkNodeClick = async (clickEvent: CustomEvent) => {
        const params: INetworkNodeClickParams = clickEvent.detail;

        const nodeViewLink = routeBuilder
            .to(SubSites.node)
            .toTarget(':id', params.nodeId)
            .toLink();
        navigator.goTo(nodeViewLink);
    };
    private onNetworkLinkClick = async (clickEvent: CustomEvent) => {
        const params: INetworkLinkClickParams = clickEvent.detail;

        const linkViewLink = routeBuilder
            .to(SubSites.link)
            .toTarget(':id', [params.startNodeId, params.endNodeId, params.transitType].join(','))
            .toLink();
        navigator.goTo(linkViewLink);
    };
}

export default SelectNetworkEntityTool;
