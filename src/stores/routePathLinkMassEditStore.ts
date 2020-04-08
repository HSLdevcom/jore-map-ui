import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import BaseTool from '~/components/map/tools/BaseTool';
import ToolbarToolType from '~/enums/toolbarToolType';
import EventHelper from '~/helpers/EventHelper';
import { IRoutePathLink } from '~/models';
import ToolbarStore from '~/stores/toolbarStore';

class RoutePathLinkMassEditStore {
    @observable private _isMassEditSelectionAllowed: boolean;
    @observable private _selectedMassEditRoutePathLinks: IRoutePathLink[];

    constructor() {
        this._isMassEditSelectionAllowed = false;
        this._selectedMassEditRoutePathLinks = [];

        EventHelper.on('ctrl', () => this.setIsMassEditSelectionAllowed(true));
        EventHelper.on('shift', () => this.setIsMassEditSelectionAllowed(true));
        EventHelper.on('keyUp', () => this.setIsMassEditSelectionAllowed(false));

        reaction(() => this._selectedMassEditRoutePathLinks.length, this.setDisabledTools);
    }

    @computed
    get isMassEditSelectionEnabled() {
        return this._isMassEditSelectionAllowed;
    }

    @computed
    get selectedMassEditRoutePathLinks() {
        return this._selectedMassEditRoutePathLinks;
    }

    @action
    public setIsMassEditSelectionAllowed = (isAllowed: boolean) => {
        this._isMassEditSelectionAllowed = isAllowed;
    };

    @action
    public toggleSelectedRoutePathLink = (routePathLink: IRoutePathLink) => {
        const currentIndex = this.getSelectedRoutePathLinkIndex(routePathLink);
        currentIndex > -1
            ? this._selectedMassEditRoutePathLinks.splice(currentIndex, 1)
            : (this._selectedMassEditRoutePathLinks = this._selectedMassEditRoutePathLinks.concat([
                  routePathLink
              ]));
    };

    public getSelectedRoutePathLinkIndex = (routePathLink: IRoutePathLink) => {
        return this._selectedMassEditRoutePathLinks.findIndex(
            rpLink =>
                rpLink.startNode.id === routePathLink.startNode.id &&
                rpLink.endNode.id === routePathLink.endNode.id
        );
    };

    // TODO: call this when routePathLinks change:
    @action
    public removeSelectedRoutePathLink = (routePathLink: IRoutePathLink) => {
        const currentIndex = this.getSelectedRoutePathLinkIndex(routePathLink);
        if (currentIndex) {
            this._selectedMassEditRoutePathLinks.splice(currentIndex, 1);
        }
    };

    @action
    public clear = () => {
        this._selectedMassEditRoutePathLinks = [];
    };

    private setDisabledTools = () => {
        if (this._selectedMassEditRoutePathLinks.length > 0) {
            // Map ToolbarStore.tools (type BaseTool[]) into toolTypesToDisable (type ToolbarToolType[])
            const toolsToDisable: BaseTool[] = [];
            _.forOwn(ToolbarStore.tools, value => {
                toolsToDisable.push(value);
            });
            const selectNetworkToolIndex = toolsToDisable.findIndex(
                tool => tool.toolType === ToolbarToolType.SelectNetworkEntity
            );
            toolsToDisable.splice(selectNetworkToolIndex, 1);
            const toolTypesToDisable: ToolbarToolType[] = toolsToDisable.map(tool => tool.toolType);
            ToolbarStore.setDisabledTools(toolTypesToDisable);
            ToolbarStore.setUndoButtonsDisabled(true);
        } else {
            ToolbarStore.setDisabledTools(null);
            ToolbarStore.setUndoButtonsDisabled(false);
        }
    };
}

export default new RoutePathLinkMassEditStore();

export { RoutePathLinkMassEditStore };
