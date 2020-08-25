import ToolbarToolType from '~/enums/toolbarToolType';

export default interface BaseTool {
    toolType: ToolbarToolType;
    phase: string | null;
    activate: Function;
    deactivate: Function;
    toolHelpHeader?: string;
    toolHelpText?: string;
    onRoutePathLinkClick?: Function;
}
