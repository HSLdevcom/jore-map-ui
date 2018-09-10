import { RouterStore } from 'mobx-react-router';
import qs from 'qs';
import QueryParams from './queryParams';

class Navigator {
    private _store: RouterStore;

    constructor() {
        this._store = new RouterStore();
    }

    public getStore() {
        return this._store;
    }

    public goTo(url: string) {
        this._store.history.push(url);
    }

    public getQueryParam(param: QueryParams) {
        return this.getQueryParamValues()[param];
    }

    public getQueryParamValues() {
        return qs.parse(
            this._store.location.search,
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
