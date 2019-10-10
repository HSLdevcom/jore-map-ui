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
    defaultTool,
    new AddNetworkNodeTool(),
    new AddNetworkLinkTool(),
    new ExtendRoutePathTool(),
    new CopyRoutePathSegmentTool(),
    new RemoveRoutePathLinkTool(),
    new PrintTool(),
    new SplitLinkTool()
];

const TOOLS = {};
TOOL_LIST.map((tool: BaseTool) => (TOOLS[tool.toolType] = tool));

export class ToolbarStore {
    @observable private _selectedTool: BaseTool | null;
    @observable private _disabledTools: ToolbarTool[];
    constructor() {
        this._disabledTools = [ToolbarTool.Print];
        this.selectDefaultTool();
    }

    @computed
    get selectedTool(): BaseTool | null {
        return this._selectedTool;
    }

    @action
    public selectTool = (tool: ToolbarTool | null) => {
        if (this._selectedTool) {
            this._selectedTool.deactivate();
        }

        // deselect current tool
        if (tool === null || (this._selectedTool && this._selectedTool.toolType === tool)) {
            this.selectDefaultTool();
            return;
        }
        const foundTool = TOOLS[tool];
        this._selectedTool = foundTool;
        if (!this._selectedTool) {
            throw new Error('Tried to select tool that was not found');
        }
        this._selectedTool.activate();
    };

    public isSelected = (tool: ToolbarTool): boolean => {
        return Boolean(this._selectedTool && this._selectedTool.toolType === tool);
    };

    public isDisabled = (tool: ToolbarTool): boolean => {
        return this._disabledTools.indexOf(tool) > -1;
    };

    @action
    private selectDefaultTool() {
        this._selectedTool = defaultTool;
        this._selectedTool.activate();
    }
}

const observableToolbarStore = new ToolbarStore();

export default observableToolbarStore;
