import { action, computed, observable } from 'mobx';
import httpStatusDescriptionCodeList from '~/codeLists/httpStatusDescriptionCodeList';
import IError from '~/models/IError';
import AlertStore, { AlertType } from './alertStore';

class ErrorStore {
    @observable private _errors: string[];

    constructor() {
        this._errors = [];
    }

    @computed
    get latestError() {
        const errors = this._errors;
        if (!errors || errors.length === 0) return null;

        return errors[errors.length - 1];
    }

    @computed
    get errors() {
        return this._errors;
    }

    @action
    public addError(message: string, error?: IError) {
        if (error && error.errorCode === 409) {
            AlertStore!.setNotificationMessage({
                message: httpStatusDescriptionCodeList[409],
                onClose: () => {
                    window.location.reload();
                },
                closeButtonText: 'Päivitä sivu',
                type: AlertType.Info,
            });
            return;
        }
        let msg = message;
        if (error && error.errorCode && httpStatusDescriptionCodeList[error.errorCode]) {
            msg += `, ${httpStatusDescriptionCodeList[error.errorCode]}`;
        } else if (error && error.message) {
            msg += `, ${error.message}`;
        }
        this._errors.push(msg);
        // tslint:disable-next-line:no-console
        if (error) console.error(error);
    }

    @action
    public pop() {
        return this._errors.length > 0 && this._errors.pop();
    }
}

export default new ErrorStore();

export { ErrorStore };
