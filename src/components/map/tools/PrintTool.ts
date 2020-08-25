import ToolbarToolType from '~/enums/toolbarToolType';
import BaseTool from './BaseTool';

// TODO: implement this tool
class PrintTool implements BaseTool {
    public toolType = ToolbarToolType.Print;
    public toolPhase: null = null;
    public activate = () => {};
    public deactivate = () => {};
    public setToolPhase = () => {};
}

export default PrintTool;
