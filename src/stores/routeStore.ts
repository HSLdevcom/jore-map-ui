import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { IRoute } from '~/models';

class RouteStore {
    @observable private _route: IRoute|null;
    @observable private _oldRoute: IRoute|null;

    @computed
    get route(): IRoute|null {
        return this._route;
    }

    get isDirty() {
        return !_.isEqual(this._route, this._oldRoute);
    }

    @action
    public setRoute = (route: IRoute) => {
        this._route = route;
        this.setOldRoute(this._route);
    }

    @action
    public setOldRoute = (route: IRoute) => {
        this._oldRoute = _.cloneDeep(route);
    }

    @action
    public updateRouteProperty = (property: string, value: string|number|Date) => {
        this._route = {
            ...this._route!,
            [property]: value,
        };
    }

    @action
    public resetChanges = () => {
        if (this._oldRoute) {
            this.setRoute(this._oldRoute);
        }
    }

    @action
    public clear = () => {
        this._route = null;
    }

}

export default new RouteStore();

export {
    RouteStore,
};
