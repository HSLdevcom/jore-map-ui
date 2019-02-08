import { computed, observable, action } from 'mobx';

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
    public push(error: string) {
        this._errors.push(error);
    }

    @action
    public pop() {
        return this._errors.length > 0 &&
            this._errors.pop();
    }
}

const observableErrorStore = new ErrorStore();

export default observableErrorStore;
