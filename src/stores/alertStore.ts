import { action, computed, observable } from 'mobx';
import Constants from '~/constants/constants';

export enum AlertType {
    Success = 1,
    Info,
    Loader,
}

export class AlertStore {
    @observable private _message: string|null;
    @observable private _type: AlertType|null;

    constructor() {
        this._message = null;
    }

    @computed
    get message() {
        return this._message;
    }

    @computed
    get type() {
        return this._type;
    }

    @computed
    get isAlertOpen(): boolean {
        return this._message !== null;
    }

    @action
    public setFadeMessage = (message: string, type: AlertType = AlertType.Success) => {
        this._message = message;
        this._type = type;

        return new Promise((resolve) => {
            setTimeout(
                () => {
                    this.close();
                    resolve();
                },
                Constants.FADE_ALERT_TIMEOUT,
            );
        });
    }

    @action
    public setLoaderMessage = (message: string) => {
        this._message = message;
        this._type = AlertType.Loader;
    }

    @action
    public closeLoaderMessage = () => {
        this.close();
    }

    @action
    public close = () => {
        this._message = null;
        this._type = null;
    }
}

export default new AlertStore();
