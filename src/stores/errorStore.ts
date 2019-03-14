import { computed, observable, action } from 'mobx';
import httpStatusDescriptionCodeList from '~/codeLists/httpStatusDescriptionCodeList';

export class ErrorStore {
    @observable private _errors: string[];

    constructor() {
        this._errors = [];
    }

    @computed
    get latestError() {
        const length = this._errors.length;
        return length > 0 ?
            this._errors[length - 1] :
            null;
    }

    @computed
    get errorCount() {
        return this._errors.length;
    }

    @action
    public addError(message: string, error?: object) {
        let msg = message;
        if (
            error &&
            error['errorCode'] &&
            httpStatusDescriptionCodeList[error['errorCode']]
        ) {
            msg += `, ${httpStatusDescriptionCodeList[error['errorCode']]}`;
        }
        this._errors.push(msg);
        // tslint:disable-next-line:no-console
        if (error) console.error(error);
    }

    @action
    public pop() {
        return this._errors.length > 0 &&
            this._errors.pop();
    }
}

const observableErrorStore = new ErrorStore();

export default observableErrorStore;
