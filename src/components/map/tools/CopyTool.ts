import ToolbarTool from '~/enums/toolbarTool';
import BaseTool from './BaseTool';

class CopyTool implements BaseTool {
    public toolType = ToolbarTool.Copy; // TODO: rename? Name too generic?
    public activate() {}
    public deactivate() {}
}

export default CopyTool;
