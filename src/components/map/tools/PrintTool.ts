import ToolbarTool from '~/enums/toolbarTool';
import BaseTool from './BaseTool';

class Print implements BaseTool {
    public toolType = ToolbarTool.Print;
    public activate() {}
    public deactivate() {}
}

export default Print;
