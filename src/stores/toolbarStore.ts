import { observable, computed, action } from 'mobx';
import ToolbarTool from '~/enums/toolbarTool';
import EditMode from '~/enums/editMode';

export class ToolbarStore {
    @observable private _activeTool: ToolbarTool;
    @observable private _disabledTools: ToolbarTool[];
    @observable private _editMode: EditMode;

    constructor() {
        this._disabledTools = [
            ToolbarTool.Print,
        ];
        this._activeTool = ToolbarTool.None;
    }

    @computed
    get activeTool(): ToolbarTool {
        return this._activeTool;
    }

    @action setEditMode(editMode: EditMode) {
        this._editMode = editMode;
    }

    @computed get editMode(): EditMode {
        return this._editMode;
    }

    @action
    public toggleTool(tool: ToolbarTool) {
        if (!this.isDisabled(tool)) {
            this._activeTool = (this._activeTool === tool) ? ToolbarTool.None : tool;
        }
    }

    public isActive(tool: ToolbarTool): boolean {
        return this._activeTool === tool;
    }

    public isDisabled(tool: ToolbarTool): boolean {
        return this._disabledTools.indexOf(tool) > -1;
    }
}

const observableToolbarStore = new ToolbarStore();

export default observableToolbarStore;
