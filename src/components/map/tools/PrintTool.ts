import ToolbarToolType from '~/enums/toolbarToolType';
import BaseTool from './BaseTool';

// TODO: implement this tool
class PrintTool implements BaseTool {
    public toolType = ToolbarToolType.Print;
    public phase: null = null;
    public activate() {}
    public deactivate() {}
}

export default PrintTool;
