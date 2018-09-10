import RouteBuilderContext from './routeBuilderContext';
import subSites from './subSites';
import navigator from './navigator';
import { RouterStore } from 'mobx-react-router';

export class RouteBuilder {
    private _routerStore: RouterStore;

    constructor() {
        this._routerStore = navigator.getStore();
    }

    public to(subSites: subSites) {
        return new RouteBuilderContext(
            subSites,
            navigator.getQueryParamValues(),
        );
    }

    public current() {
        return new RouteBuilderContext(
            this.getCurrentLocation(),
            navigator.getQueryParamValues(),
        );
    }

    public getCurrentLocation() {
        return this._routerStore.location.pathname;
    }
}

export default new RouteBuilder();
