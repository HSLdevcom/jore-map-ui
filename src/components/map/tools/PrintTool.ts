import ToolbarTool from '~/enums/toolbarTool';
import BaseTool from './BaseTool';

export default class Print implements BaseTool {
    public toolType = ToolbarTool.Print;
    public activate() {}
    public deactivate() {}
}
