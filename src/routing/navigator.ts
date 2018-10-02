import { RouterStore } from 'mobx-react-router';
import qs from 'qs';
import QueryParams from './queryParams';

class Navigator {
    private store: RouterStore;

    constructor() {
        this.store = new RouterStore();
    }

    public getStore() {
        return this.store;
    }

    public goTo(url: string) {
        this.store.history.push(url);
    }

    // TODO, rename
    public getQueryParam(param: QueryParams) {
        return this.getQueryParamValues()[param];
    }

    // TODO, rename
    public getQueryParamValues() {
        return qs.parse(
            this.store.location.search,
            { ignoreQueryPrefix: true },
        );
    }

    /* not used yet

    public goBack() {
        this._store.goBack();
    }

    public goForward() {
        this._store.goForward();
    } */
}

export default new Navigator();
