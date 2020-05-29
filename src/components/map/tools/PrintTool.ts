import ToolbarToolType from '~/enums/toolbarToolType';
import BaseTool from './BaseTool';

class PrintTool implements BaseTool {
    public toolType = ToolbarToolType.Print;
    public activate() {}
    public deactivate() {}
}

export default PrintTool;
