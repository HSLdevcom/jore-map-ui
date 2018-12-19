import ToolbarTool from '~/enums/toolbarTool';
import BaseTool from './BaseTool';

class AddNetworkNodeTool implements BaseTool {
    public toolType = ToolbarTool.AddNetworkNode;
    public activate() {}
    public deactivate() {}
}

export default AddNetworkNodeTool;
