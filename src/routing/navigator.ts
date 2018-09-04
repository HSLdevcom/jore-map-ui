import { RouterStore } from 'mobx-react-router';

class Navigator {
    private _store: RouterStore;

    constructor() {
        this._store = new RouterStore();
    }

    public getStore() {
        return this._store;
    }

    public push(url: string) {
        this._store.history.push(url);
    }

    public goBack() {
        this._store.goBack();
    }

    public goForward() {
        this._store.goForward();
    }
}

export default new Navigator();
