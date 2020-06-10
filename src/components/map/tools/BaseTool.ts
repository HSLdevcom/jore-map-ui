import ToolbarToolType from '~/enums/toolbarToolType';

export default interface BaseTool {
    toolType: ToolbarToolType;
    activate: Function;
    deactivate: Function;
    toolHelpHeader?: string;
    toolHelpText?: string;
    onRoutePathLinkClick?: Function;
}
