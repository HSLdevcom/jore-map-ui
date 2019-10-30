import _ from 'lodash';
import { action, computed, observable } from 'mobx';
import { IRoute } from '~/models';

class RouteStore {
    @observable private _route: IRoute | null;
    @observable private _oldRoute: IRoute | null;
    @observable private _isEditingDisabled: boolean;

    constructor() {
        this._isEditingDisabled = true;
    }

    @computed
    get route(): IRoute | null {
        return this._route;
    }

    @computed
    get isDirty() {
        // line and routePaths can't change in routeView, omit them from
        // the comparison to prevent lag
        return !_.isEqual(
            _.omit(this._route, ['line', 'routePaths']),
            _.omit(this._oldRoute, ['line', 'routePaths'])
        );
    }

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    @action
    public setRoute = (route: IRoute) => {
        this._route = route;
        this.setOldRoute(this._route);
    };

    @action
    public setOldRoute = (route: IRoute) => {
        this._oldRoute = _.cloneDeep(route);
    };

    @action
    public updateRouteProperty = (property: keyof IRoute, value: string | number | Date) => {
        this._route = {
            ...this._route!,
            [property]: value
        };
    };

    @action
    public setIsEditingDisabled = (isEditingDisabled: boolean) => {
        this._isEditingDisabled = isEditingDisabled;
    };

    @action
    public toggleIsEditingDisabled = () => {
        this._isEditingDisabled = !this._isEditingDisabled;
    };

    @action
    public clear = () => {
        this._route = null;
    };

    @action
    public resetChanges = () => {
        if (this._oldRoute) {
            this.setRoute(this._oldRoute);
        }
    };
}

export default new RouteStore();

export { RouteStore };
