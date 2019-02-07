import { computed, observable } from 'mobx';

export class ErrorStore {
    @observable private _error: string | null;

    constructor() {
        this._error = null;
    }

    @computed
    get error() {
        return this._error;
    }

    set error(error: string | null) {
        this._error = error;
        setTimeout(() => {
            this.error = null;
        },         10000);
    }
}

const observableErrorStore = new ErrorStore();

export default observableErrorStore;
