import ToolbarTool from '~/enums/toolbarTool';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import BaseTool from './BaseTool';

/**
 * Tool for creating new routePath
 */
class SelectNetworkEntityTool implements BaseTool {
    public toolType = ToolbarTool.SelectNetworkEntity;
    public activate() {}
    public deactivate() {}

    public onNetworkNodeClick = async (clickEvent: any) => {
        const nodeId = clickEvent.sourceTarget.properties.soltunnus;

        const nodeViewLink = routeBuilder
            .to(SubSites.node)
            .toTarget(nodeId)
            .toLink();
        navigator.goTo(nodeViewLink);
    }
    public onNetworkLinkClick = async (clickEvent: any) => {
        const properties = clickEvent.sourceTarget.properties;
        const startNodeId = properties.lnkalkusolmu;
        const endNodeId = properties.lnkloppusolmu;
        const transitType = properties.lnkverkko;

        const linkViewLink = routeBuilder
            .to(SubSites.link)
            .toTarget([
                startNodeId,
                endNodeId,
                transitType,
            ].join(','))
            .toLink();
        navigator.goTo(linkViewLink);
    }
}

export default SelectNetworkEntityTool;
