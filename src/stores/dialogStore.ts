import { action, computed, observable } from 'mobx';
import Constants from '~/constants/constants';

export class DialogStore {
    @observable private _message: string|null;

    constructor() {
        this._message = null;
    }

    @computed
    get message() {
        return this._message;
    }

    @computed
    get isDialogOpen(): boolean {
        return this._message !== null;
    }

    @action
    public setFadeMessage = (message: string) => {
        this._message = message;

        return new Promise((resolve) => {
            setTimeout(
                () => {
                    this.close();
                    resolve();
                },
                Constants.FADE_DIALOG_TIMEOUT,
            );
        });
    }

    @action
    public close = () => {
        this._message = null;
    }
}

const observableDialogStore = new DialogStore();

export default observableDialogStore;
