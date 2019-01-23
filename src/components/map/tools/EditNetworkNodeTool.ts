import NetworkStore, { NodeSize } from '~/stores/networkStore';
import EditNetworkStore from '~/stores/editNetworkStore';
import ToolbarTool from '~/enums/toolbarTool';
import routeBuilder  from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import BaseTool from './BaseTool';

/**
 * Tool for editing selected network node's 3 type of locations and links that have selected node
 * as either start or end node
 */
class EditNetworkNodeTool implements BaseTool {
    public toolType = ToolbarTool.EditNetworkNode;

    public activate() {
        NetworkStore.setNodeSize(NodeSize.large);
    }
    public deactivate() {
        NetworkStore.setNodeSize(NodeSize.normal);
        EditNetworkStore.clear();
    }

    public onNetworkNodeClick = async (clickEvent: any) => {
        const properties =  clickEvent.sourceTarget.properties;
        const editNetworkLink = routeBuilder
            .to(subSites.networkNode)
            .toTarget(properties.soltunnus)
            .toLink();
        navigator.goTo(editNetworkLink);
    }
}

export default EditNetworkNodeTool;
