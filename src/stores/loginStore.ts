import { action, computed, observable } from 'mobx';
import Constants from '~/constants/constants';

export class LoginStore {
    @observable private _isAuthenticated: boolean;
    @observable private _userEmail: string;

    constructor() {
        this._isAuthenticated = !Constants.isLoginRequired;
        this._userEmail = '';
    }

    @computed
    get isAuthenticated() {
        return this._isAuthenticated;
    }

    @computed
    get userEmail() {
        return this._userEmail;
    }

    @action
    public setIsAuthenticated(isAuthenticated: boolean, userEmail: string) {
        this._isAuthenticated = isAuthenticated;
        this._userEmail = userEmail;
    }
}

const observableLoginStore = new LoginStore();

export default observableLoginStore;
