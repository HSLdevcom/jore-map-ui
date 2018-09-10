import qs from 'qs';
import RouteBuilderContext from './routeBuilderContext';
import subSites from './subSites';
import navigator from './navigator';
import { RouterStore } from 'mobx-react-router';
import QueryParams from './queryParams';

export class RouteBuilder {
    private _routerStore: RouterStore;

    constructor() {
        this._routerStore = navigator.getStore();
    }

    private getLocation() {
        return this._routerStore.location.pathname;
    }

    private getValues() {
        return qs.parse(
            this._routerStore.location.search,
            { ignoreQueryPrefix: true },
        );
    }

    public to(subSites: subSites) {
        return new RouteBuilderContext(subSites, this.getValues());
    }

    public current() {
        return new RouteBuilderContext(this.getLocation(), this.getValues());
    }

    public getValue(param: QueryParams) {
        return this.getValues()[param];
    }

    public getCurrentLocation() {
        return this._routerStore.location.pathname;
    }
}

export default new RouteBuilder();
