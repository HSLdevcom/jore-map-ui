import { observable, computed, action } from 'mobx';
import ToolbarTools from '../enums/toolbarTools';
import EditMode from '../enums/editMode';

export class ToolbarStore {
    @observable private _activeTool: ToolbarTools;
    @observable private _disabledTools: ToolbarTools[];
    @observable private _editMode: EditMode;

    constructor() {
        this._disabledTools = [
            ToolbarTools.Print,
        ];
        this._editMode = EditMode.LINE;
        this._activeTool = ToolbarTools.None;
    }

    @computed
    get activeTool(): ToolbarTools {
        return this._activeTool;
    }

    @action setEditMode(editMode: EditMode) {
        this._editMode = editMode;
    }

    @computed get editMode(): EditMode {
        return this._editMode;
    }

    @action
    public toggleTool(tool: ToolbarTools) {
        if (!this.isDisabled(tool)) {
            this._activeTool = (this._activeTool === tool) ? ToolbarTools.None : tool;
        }
    }

    public isActive(tool: ToolbarTools): boolean {
        return this._activeTool === tool;
    }

    public isDisabled(tool: ToolbarTools): boolean {
        return this._disabledTools.indexOf(tool) > -1;
    }
}

const observableToolbarStore = new ToolbarStore();

export default observableToolbarStore;
