import ToolbarTool from '~/enums/toolbarTool';
import BaseTool from './BaseTool';

export default class DivideLink implements BaseTool {
    public toolType = ToolbarTool.DivideLink; // TODO: rename as DivideNetworkLinkTool (?)
    public activate() {}
    public deactivate() {}
}
