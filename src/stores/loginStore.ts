import { action, computed, observable } from 'mobx';
import Constants from '~/constants/constants';

import { IAuthorizationResponse } from '~/services/authService';

export class LoginStore {
    @observable private _isAuthenticated: boolean;
    @observable private _hasWriteAccess: boolean;
    @observable private _userEmail?: string;

    constructor() {
        this._isAuthenticated = !Constants.isLoginRequired;
    }

    @computed
    get isAuthenticated() {
        return this._isAuthenticated;
    }

    @computed
    get hasWriteAccess() {
        return this._hasWriteAccess;
    }

    @computed
    get userEmail() {
        return this._userEmail;
    }

    @action
    public setAuthenticationInfo(authRespose: IAuthorizationResponse) {
        this._isAuthenticated = authRespose.isOk;
        this._hasWriteAccess = authRespose.hasWriteAccess;
        this._userEmail = authRespose.email;

        // TODO: this is only temporary:
        // tslint:disable-next-line:no-console
        console.log(`User: ${authRespose.email} is now authenticated`);
    }
}

const observableLoginStore = new LoginStore();

export default observableLoginStore;
