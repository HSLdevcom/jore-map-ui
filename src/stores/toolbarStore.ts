import { action, computed, observable } from 'mobx';
import ToolbarTool from '~/enums/toolbarTool';
import BaseTool from '~/components/map/tools/BaseTool';
import AddNetworkNodeTool from '~/components/map/tools/AddNetworkNodeTool';
import ExtendRoutePathTool from '~/components/map/tools/ExtendRoutePathTool';
import CopyTool from '~/components/map/tools/CopyTool';
import DivideLinkTool from '~/components/map/tools/DivideLinkTool';
import PrintTool from '~/components/map/tools/PrintTool';
import RemoveRoutePathLinkTool from '~/components/map/tools/RemoveRoutePathLinkTool';
import SelectNetworkEntityTool from '~/components/map/tools/SelectNetworkEntityTool';

const defaultTool = new SelectNetworkEntityTool();

const TOOL_LIST = [
    defaultTool,
    new AddNetworkNodeTool(),
    new ExtendRoutePathTool(),
    new CopyTool(),
    new DivideLinkTool(),
    new RemoveRoutePathLinkTool(),
    new PrintTool(),
];

const TOOLS = {};
TOOL_LIST.map((tool: BaseTool) => TOOLS[tool.toolType] = tool);

export class ToolbarStore {
    @observable private _selectedTool: BaseTool|null;
    @observable private _disabledTools: ToolbarTool[];
    constructor() {
        this._disabledTools = [
            ToolbarTool.Print,
        ];
        this._selectedTool = defaultTool;
    }

    @computed
    get selectedTool(): BaseTool | null {
        return this._selectedTool;
    }

    @action
    public selectTool = (tool: ToolbarTool | null) => {
        if (this._selectedTool) {
            this._selectedTool.deactivate();
        }

        // deselect current tool
        if (tool === null || (this._selectedTool && this._selectedTool.toolType === tool)) {
            this._selectedTool = defaultTool;
            return;
        }
        const foundTool = TOOLS[tool];
        this._selectedTool = foundTool;
        if (!this._selectedTool) {
            throw new Error('Tried to select tool that was not found');
        }
        this._selectedTool.activate();
    }

    public isSelected = (tool: ToolbarTool): boolean => {
        return Boolean(this._selectedTool && this._selectedTool.toolType === tool);
    }

    public isDisabled = (tool: ToolbarTool): boolean => {
        return this._disabledTools.indexOf(tool) > -1;
    }
}

const observableToolbarStore = new ToolbarStore();

export default observableToolbarStore;
