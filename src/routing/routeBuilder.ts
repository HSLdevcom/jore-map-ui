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

    private getQueryParamValues() {
        return qs.parse(
            this._routerStore.location.search,
            { ignoreQueryPrefix: true },
        );
    }

    public to(subSites: subSites) {
        return new RouteBuilderContext(subSites, this.getQueryParamValues());
    }

    public current() {
        return new RouteBuilderContext(this.getCurrentLocation(), this.getQueryParamValues());
    }

    public getQueryParam(param: QueryParams) {
        return this.getQueryParamValues()[param];
    }

    public getCurrentLocation() {
        return this._routerStore.location.pathname;
    }
}

export default new RouteBuilder();
