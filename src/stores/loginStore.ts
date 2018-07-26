import { observable } from 'mobx'

export class LoginStore {
    @observable private _showLogin: boolean

    constructor() {
      this._showLogin = false
    }

    get showLogin(): boolean {
        return this._showLogin
    }

    set showLogin(showLogin: boolean) {
        this._showLogin = showLogin
    }
}

const observableLoginStore = new LoginStore()

export default observableLoginStore