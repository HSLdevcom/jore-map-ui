import ToolbarTool from '~/enums/toolbarTool';
import EventManager from '~/util/EventManager';
import BaseTool from './BaseTool';

/**
 * Tool for splitting link
 */
class SplitLinkTool implements BaseTool {
    public toolType = ToolbarTool.SplitLink;
    public activate() {
        EventManager.on('networkNodeClick', this.confirmNode);
    }
    public deactivate() {
        EventManager.off('networkNodeClick', this.confirmNode);
    }

    private confirmNode = async (clickEvent: CustomEvent) => {
        const nodeId = clickEvent.detail.nodeId;

        alert(nodeId);
    }
}

export default SplitLinkTool;
