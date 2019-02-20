import { action, computed, observable } from 'mobx';
import Constants from '~/constants/constants';

export class LoginStore {
    @observable private _isAuthenticated: boolean;

    constructor() {
        this._isAuthenticated = !Constants.isLoginRequired;
    }

    @computed
    get isAuthenticated(): boolean {
        return this._isAuthenticated;
    }

    @action
    public setIsAuthenticated(isAuthenticated: boolean) {
        this._isAuthenticated = isAuthenticated;
    }
}

const observableLoginStore = new LoginStore();

export default observableLoginStore;
