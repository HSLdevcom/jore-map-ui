import { observable, computed, action } from 'mobx';
import ToolbarTools from '../enums/toolbarTools';

export class ToolbarStore {
    @observable private _activeTool: ToolbarTools;
    @observable private _disabledTools: ToolbarTools[];

    constructor() {
        this._disabledTools = [
            ToolbarTools.Print,
        ];
        this._activeTool = ToolbarTools.None;
    }

    @computed
    get activeTool(): ToolbarTools {
        return this._activeTool;
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
