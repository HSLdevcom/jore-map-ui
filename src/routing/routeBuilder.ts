import { RouterStore } from 'mobx-react-router';
import RouteBuilderContext from './routeBuilderContext';
import subSites from './subSites';
import navigator from './navigator';

export class RouteBuilder {
    private routerStore: RouterStore;

    constructor() {
        this.routerStore = navigator.getStore();
    }

    public to(subSites: subSites) {
        return new RouteBuilderContext(
            this.getCurrentLocation(),
            subSites,
            navigator.getQueryParamValues(),
        );
    }

    public getCurrentLocation() {
        return this.routerStore.location.pathname;
    }
}

export default new RouteBuilder();
