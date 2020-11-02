import { RouterStore } from 'mobx-react-router';
import qs from 'qs';
import ConfirmStore from '~/stores/confirmStore';
import NavigationStore from '~/stores/navigationStore';
import QueryParams from './queryParams';

const DEFAULT_PROMPT_MESSAGE = `Sinulla on tallentamattomia muutoksia. Haluatko poistua näkymästä? Tallentamattomat muutokset kumotaan.`;

class Navigator {
    private store: RouterStore;

    constructor() {
        this.store = new RouterStore();
    }

    public getStore = () => {
        return this.store;
    };

    public goTo = ({
        link,
        unsavedChangesPromptMessage,
        shouldSkipUnsavedChangesPrompt,
        shouldSkipNavigationAction,
    }: {
        link: string;
        unsavedChangesPromptMessage?: string;
        shouldSkipUnsavedChangesPrompt?: boolean;
        shouldSkipNavigationAction?: boolean;
    }) => {
        // prevent new pushing url if the current url is already the right one
        if (this.store.location.pathname === link) return;

        const redirectFunction = () => this.store.history.push(link);
        this.callRedirectFunction({
            redirectFunction,
            unsavedChangesPromptMessage,
            shouldSkipUnsavedChangesPrompt,
            shouldSkipNavigationAction,
        });
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
            ignoreQueryPrefix: true,
        });
    };

    public goBack = ({
        unsavedChangesPromptMessage,
        shouldSkipUnsavedChangesPrompt,
        shouldSkipNavigationAction,
    }: {
        unsavedChangesPromptMessage?: string;
        shouldSkipUnsavedChangesPrompt?: boolean;
        shouldSkipNavigationAction?: boolean;
    }) => {
        this.callRedirectFunction({
            unsavedChangesPromptMessage,
            shouldSkipUnsavedChangesPrompt,
            shouldSkipNavigationAction,
            redirectFunction: this.store.goBack,
        });
    };

    /* not used yet

    public goForward() {
        this._store.goForward();
    } */

    private callRedirectFunction = ({
        redirectFunction: callback,
        unsavedChangesPromptMessage,
        shouldSkipUnsavedChangesPrompt,
        shouldSkipNavigationAction,
    }: {
        redirectFunction: Function;
        unsavedChangesPromptMessage?: string;
        shouldSkipUnsavedChangesPrompt?: boolean;
        shouldSkipNavigationAction?: boolean;
    }) => {
        if (
            !Boolean(shouldSkipUnsavedChangesPrompt) &&
            NavigationStore.shouldShowUnsavedChangesPrompt
        ) {
            ConfirmStore!.openConfirm({
                confirmData: unsavedChangesPromptMessage
                    ? unsavedChangesPromptMessage
                    : DEFAULT_PROMPT_MESSAGE,
                onConfirm: () => {
                    _callNavigationAction(shouldSkipNavigationAction);
                    callback();
                },
                confirmButtonText: 'Kyllä',
            });
        } else {
            _callNavigationAction(shouldSkipNavigationAction);
            callback();
        }
    };
}

const _callNavigationAction = (shouldSkipNavigationAction?: boolean) => {
    if (shouldSkipNavigationAction) return;

    NavigationStore.setShouldShowUnsavedChangesPrompt(false);
    const navigationAction = NavigationStore.navigationAction;
    if (navigationAction) {
        navigationAction();
    }
};

export default new Navigator();
