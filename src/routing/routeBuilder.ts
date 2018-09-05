import * as qs from 'qs';
import RouteBuilderContext from './routeBuilderContext';
import { Url } from './routing';
import navigator from './navigator';
import { RouterStore } from 'mobx-react-router';

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

    public to(route: Url) {
        return new RouteBuilderContext(route.location, this.getValues());
    }

    public current() {
        return new RouteBuilderContext(this.getLocation(), this.getValues());
    }

    public getValue(name: string) {
        return this.getValues()[name];
    }

    public getCurrentLocation() {
        return this.getLocation();
    }

    public getCurrentSearchParameters() {
        return this.getValues();
    }
}

export default new RouteBuilder();
