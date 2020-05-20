import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import { IRoutePathLink } from '~/models';
import ToolbarStore from './toolbarStore';

class RoutePathLinkMassEditStore {
    @observable private _selectedMassEditRoutePathLinks: IRoutePathLink[];

    constructor() {
        this._selectedMassEditRoutePathLinks = [];

        reaction(
            () => this._selectedMassEditRoutePathLinks.length,
            _.debounce(() => ToolbarStore.updateDisabledRoutePathToolStatus(), 25)
        );
    }

    @computed
    get selectedMassEditRoutePathLinks() {
        return this._selectedMassEditRoutePathLinks;
    }

    @action
    public toggleSelectedRoutePathLink = (routePathLink: IRoutePathLink) => {
        const currentIndex = this.getSelectedRoutePathLinkIndex(routePathLink);
        currentIndex > -1
            ? this._selectedMassEditRoutePathLinks.splice(currentIndex, 1)
            : (this._selectedMassEditRoutePathLinks = this._selectedMassEditRoutePathLinks.concat([
                  routePathLink,
              ]));
    };

    public getSelectedRoutePathLinkIndex = (routePathLink: IRoutePathLink) => {
        return this._selectedMassEditRoutePathLinks.findIndex(
            (rpLink) =>
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
}

export default new RoutePathLinkMassEditStore();

export { RoutePathLinkMassEditStore };
