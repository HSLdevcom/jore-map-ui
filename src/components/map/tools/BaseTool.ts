import ToolbarToolType from '~/enums/toolbarToolType';

interface IToolPhaseHelpObj {
    phaseTopic?: string;
    phaseHelpText?: string;
}

type toolHelpPhasesMap = Record<string, IToolPhaseHelpObj>;

export default interface BaseTool {
    toolType: ToolbarToolType;
    toolPhase?: string | null;
    toolHelpHeader?: string;
    toolHelpPhasesMap?: toolHelpPhasesMap;
    activate: () => void;
    deactivate: () => void;
    getToolPhase: () => void;
    setToolPhase: (phase: string | null) => void;
    onRoutePathLinkClick?: Function; // TODO: remove?
}
