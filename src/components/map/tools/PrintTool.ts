import ToolbarTool from '~/enums/toolbarTool';
import BaseTool from './BaseTool';

class PrintTool implements BaseTool {
    public toolType = ToolbarTool.Print;
    public activate() {}
    public deactivate() {}
}

export default PrintTool;
