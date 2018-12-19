import ToolbarTool from '~/enums/toolbarTool';
import BaseTool from './BaseTool';

class DivideLinkTool implements BaseTool {
    public toolType = ToolbarTool.DivideLink; // TODO: rename as DivideNetworkLinkTool (?)
    public activate() {}
    public deactivate() {}
}

export default DivideLinkTool;
