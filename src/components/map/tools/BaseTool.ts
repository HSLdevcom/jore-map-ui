import ToolbarToolType from '~/enums/toolbarToolType';

export default interface BaseTool {
    toolType: ToolbarToolType;
    toolPhase: string | null;
    toolHelpHeader?: string; // TODO: remove
    toolHelpText?: string; // TODO: remove
    activate: () => void;
    deactivate: () => void;
    setToolPhase: (phase: string | null) => void;
    onRoutePathLinkClick?: Function; // TODO: remove?
}
