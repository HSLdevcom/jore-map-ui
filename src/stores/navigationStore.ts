import { action, computed, observable } from 'mobx';

export class NavigationStore {
    @observable private _shouldShowPrompt: boolean;

    constructor() {
        this._shouldShowPrompt = false;
    }

    @computed
    get shouldShowUnsavedChangesPrompt(): boolean {
        return this._shouldShowPrompt;
    }

    @action
    public setShouldShowUnsavedChangesPrompt = (shouldShowPrompt: boolean) => {
        this._shouldShowPrompt = shouldShowPrompt;
    };
}

export default new NavigationStore();
