import { action, computed, observable } from 'mobx';
import AddNetworkLinkTool from '~/components/map/tools/AddNetworkLinkTool';
import AddNetworkNodeTool from '~/components/map/tools/AddNetworkNodeTool';
import BaseTool from '~/components/map/tools/BaseTool';
import CopyRoutePathSegmentTool from '~/components/map/tools/CopyRoutePathSegmentTool';
import ExtendRoutePathTool from '~/components/map/tools/ExtendRoutePathTool';
import PrintTool from '~/components/map/tools/PrintTool';
import RemoveRoutePathLinkTool from '~/components/map/tools/RemoveRoutePathLinkTool';
import SelectNetworkEntityTool from '~/components/map/tools/SelectNetworkEntityTool';
import SplitLinkTool from '~/components/map/tools/SplitLinkTool';
import ToolbarTool from '~/enums/toolbarTool';

const defaultTool = new SelectNetworkEntityTool();

const TOOL_LIST = [
    SelectNetworkEntityTool,
    AddNetworkNodeTool,
    AddNetworkLinkTool,
    ExtendRoutePathTool,
    CopyRoutePathSegmentTool,
    RemoveRoutePathLinkTool,
    PrintTool,
    SplitLinkTool
];

const TOOLS = {};
TOOL_LIST.forEach(tool => {
    const toolInstance = new tool();
    TOOLS[toolInstance.toolType] = toolInstance;
});

const DEFAULT_DISABLED_TOOLS = [ToolbarTool.Print];

class ToolbarStore {
    @observable private _selectedTool: BaseTool | null;
    @observable private _disabledTools: ToolbarTool[];
    @observable private _shouldShowEntityOpenPrompt: boolean;
    @observable private _areUndoButtonsDisabled: boolean;

    constructor() {
        this._disabledTools = DEFAULT_DISABLED_TOOLS;
        this.selectDefaultTool();
        this._shouldShowEntityOpenPrompt = false;
    }

    @computed
    get selectedTool(): BaseTool | null {
        return this._selectedTool;
    }

    @computed
    get shouldShowEntityOpenPrompt(): boolean {
        return this._shouldShowEntityOpenPrompt;
    }

    @computed
    get areUndoButtonsDisabled(): boolean {
        return this._areUndoButtonsDisabled;
    }

    @computed
    get tools() {
        return TOOLS;
    }

    @action
    public selectTool = (tool: ToolbarTool | null) => {
        if (this._selectedTool) {
            this._selectedTool.deactivate();
        }

        // deselect current tool
        if (
            tool === null ||
            tool === ToolbarTool.SelectNetworkEntity ||
            (this._selectedTool && this._selectedTool.toolType === tool)
        ) {
            // Network click event also triggers mapClick event
            // Prevents bugs where deselecting tool after a click on map also triggers map click event.
            // TODO: find a better way of achieving this.
            setTimeout(() => {
                this.selectDefaultTool();
            }, 0);
            return;
        }
        this._selectedTool = TOOLS[tool];
        if (!this._selectedTool) {
            throw new Error('Tried to select tool that was not found');
        }
        this._selectedTool.activate();
    };

    @action
    public setShouldShowEntityOpenPrompt = (shouldShowEntityOpenPrompt: boolean) => {
        this._shouldShowEntityOpenPrompt = shouldShowEntityOpenPrompt;
    };

    @action
    public setDisabledTools(disabledTools: ToolbarTool[] | null) {
        if (disabledTools) {
            this._disabledTools = disabledTools;
        } else {
            this._disabledTools = DEFAULT_DISABLED_TOOLS;
        }
    }

    @action
    public setUndoButtonsDisabled = (areDisabled: boolean) => {
        this._areUndoButtonsDisabled = areDisabled;
    };

    @action
    private selectDefaultTool() {
        this._selectedTool = defaultTool;
        this._selectedTool.activate();
    }

    public isSelected = (tool: ToolbarTool): boolean => {
        return Boolean(this._selectedTool && this._selectedTool.toolType === tool);
    };

    public isDisabled = (tool: ToolbarTool): boolean => {
        return this._disabledTools.indexOf(tool) > -1;
    };
}

export default new ToolbarStore();

export { ToolbarStore };
