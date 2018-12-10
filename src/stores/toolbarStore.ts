import { observable, computed, action } from 'mobx';
import _ from 'lodash';
import ToolbarTool from '~/enums/toolbarTool';
import EditMode from '~/enums/editMode';

import BaseTool from '~/tools/BaseTool';
import AddNetworkNodeTool from '~/tools/AddNetworkNodeTool';
import AddNewRoutePathTool from '~/tools/AddNewRoutePathTool';
import CopyTool from '~/tools/CopyTool';
import DivideLinkTool from '~/tools/DivideLinkTool';
import EditNetworkNodeTool from '~/tools/EditNetworkNodeTool';
import PrintTool from '~/tools/PrintTool';

const TOOLS = [
    new AddNetworkNodeTool(),
    new AddNewRoutePathTool(),
    new CopyTool(),
    new DivideLinkTool(),
    new EditNetworkNodeTool(),
    new PrintTool(),
];

// TODO: Rename ToolbarStore -> toolStore?
export class ToolbarStore {
    @observable private _selectedTool: BaseTool|null;
    @observable private _disabledTools: ToolbarTool[];
    @observable private _editMode: EditMode;

    constructor() {
        this._disabledTools = [
            ToolbarTool.Print,
        ];
    }

    @computed
    get selectedTool(): BaseTool | null {
        return this._selectedTool;
    }

    @action setEditMode(editMode: EditMode) {
        this._editMode = editMode;
        this.selectTool(null);
    }

    @computed
    get editMode(): EditMode {
        return this._editMode;
    }

    @action
    public selectTool(tool: ToolbarTool | null) {
        if (this._selectedTool) {
            this._selectedTool.deactivate();
        }

        // deselect current tool
        if (tool === null || (this._selectedTool && this._selectedTool.toolType === tool)) {
            this._selectedTool = null;
            return;
        }
        const foundTool = _.find(TOOLS, (_tool) => {
            return _tool.toolType === tool;
        });
        if (!foundTool) {
            throw new Error('Tried to select tool that was not found');
        }
        this._selectedTool = foundTool;
        this._selectedTool.activate();
    }

    public isSelected(tool: ToolbarTool): boolean {
        if (!this._selectedTool) return false;

        return Boolean(this._selectedTool.toolType === tool);
    }

    public isDisabled(tool: ToolbarTool): boolean {
        return this._disabledTools.indexOf(tool) > -1;
    }
}

const observableToolbarStore = new ToolbarStore();

export default observableToolbarStore;
