import ToolbarTool from '~/enums/toolbarTool';

export default interface BaseTool {
    toolType: ToolbarTool;
    activate: Function;
    deactivate: Function;
}
