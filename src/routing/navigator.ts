import { RouterStore } from 'mobx-react-router';
import qs from 'qs';
import QueryParams from './queryParams';

class Navigator {
    private store: RouterStore;

    constructor() {
        this.store = new RouterStore();
    }

    public getStore = () => {
        return this.store;
    };

    public goTo = (url: string) => {
        // prevent new pushing url if the current url is already the right one
        if (this.store.location.pathname === url) return;

        this.store.history.push(url);
    };

    // Instead of pushing to a stack (goTo function), replace current url
    public replace = (url: string) => {
        // prevent new pushing url if the current url is already the right one
        if (this.store.location.pathname === url) return;

        this.store.history.replace(url);
    };

    /**
     * @return {String} for example /routePath/new
     */
    public getPathName = () => {
        return this.store.location.pathname;
    };

    /**
     * @return {String} for example ?routes=0033
     */
    public getSearch = () => {
        return this.store.location.search;
    };

    /**
     * @return {String} for example /routePath/new?routes=0033
     */
    public getFullPath = () => {
        return `${this.store.location.pathname}${this.store.location.search}`;
    };

    // TODO, rename
    public getQueryParam = (param: QueryParams) => {
        return this.getQueryParamValues()[param];
    };

    // TODO, rename
    public getQueryParamValues = () => {
        return qs.parse(this.store.location.search, {
            ignoreQueryPrefix: true
        });
    };

    public goBack() {
        this.store.goBack();
    }

    /* not used yet

    public goForward() {
        this._store.goForward();
    } */
}

export default new Navigator();
