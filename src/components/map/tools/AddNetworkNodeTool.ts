import ToolbarTool from '~/enums/toolbarTool';
import BaseTool from './BaseTool';

export default class AddNetworkNodeTool implements BaseTool {
    public toolType = ToolbarTool.AddNetworkNode;
    public activate() {}
    public deactivate() {}
}
