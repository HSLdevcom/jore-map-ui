import { action, computed, observable } from 'mobx';
import Constants from '~/constants/constants';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import { IAuthorizationResponse } from '~/services/authService';

export class LoginStore {
    @observable private _isAuthenticated: boolean;
    @observable private _hasWriteAccess: boolean;
    @observable private _userEmail?: string;

    constructor() {
        this.clear(false);
    }

    @computed
    get isAuthenticated() {
        return this._isAuthenticated || !Constants.IS_LOGIN_REQUIRED;
    }

    @computed
    get hasWriteAccess() {
        return this._hasWriteAccess || !Constants.IS_LOGIN_REQUIRED;
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
    }

    @action
    public clear(redirectToLogin: boolean = true) {
        this._isAuthenticated = false;
        this._hasWriteAccess = false;
        this._userEmail = undefined;
        if (redirectToLogin) {
            navigator.goTo({ link: SubSites.login, shouldSkipUnsavedChangesPrompt: true });
        }
    }
}

const observableLoginStore = new LoginStore();

export default observableLoginStore;
