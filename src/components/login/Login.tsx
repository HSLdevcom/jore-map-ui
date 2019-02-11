import React from 'react';
import { inject, observer } from 'mobx-react';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import ButtonType from '~/enums/buttonType';
import Button from '../controls/Button';
import * as s from './login.scss';

interface ILoginProps {
    errorStore?: ErrorStore;
    loginStore?: LoginStore;
}

@inject('loginStore', 'errorStore')
@observer
class Login extends React.Component<ILoginProps> {
    // TODO Login logic here
    public handleUserNameOnChange = (event: React.FormEvent<HTMLInputElement>) => {
        global.console.log(event.currentTarget.value);
    }

    // TODO Login logic here
    public handlePasswordOnChange = (event: React.FormEvent<HTMLInputElement>) => {
        global.console.log(event.currentTarget.value);
    }

    public closeLoginModal = () => {
        this.props.loginStore!.showLogin = false;
        this.props.errorStore!.push('Login Modal is not in use');
    }

    public render() {
        return (
        <div className={s.loginView}>
            <h2>Kirjaudu sisään</h2>
            <form>
                <label className={s.label}>
                    Tunnus
                <br/>
                    <input
                        type='text'
                        onChange={this.handleUserNameOnChange}
                    />
                </label>
                <label className={s.label}>
                    Salasana
                <br/>
                    <input
                        type='text'
                        onChange={this.handlePasswordOnChange}
                    />
                </label>
            </form>
            <div className={s.modalButtonBar}>
                <Button
                    onClick={this.closeLoginModal}
                    type={ButtonType.SQUARE}
                >
                    Kirjaudu
                </Button>
                <div className={s.flexFiller} />
                <Button
                    onClick={this.closeLoginModal}
                    type={ButtonType.SQUARE_SECONDARY}
                >
                    Peruuta
                </Button>
            </div>
        </div>
        );
    }
}

export default Login;
