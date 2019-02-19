import React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import { Location } from 'history';
import hslLogo from '~/assets/hsl-logo.png';
import loginBackground from '~/assets/loginBackground.jpg';
import AuthService from '~/services/authService';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import * as s from './login.scss';

interface ILoginProps {
    errorStore?: ErrorStore;
    loginStore?: LoginStore;
    location?: Location;
}

@inject('loginStore', 'errorStore')
@observer
class Login extends React.Component<ILoginProps> {
    public login = () => {
        AuthService.authenticate((success: boolean) => {
            if (success) {
                this.props.loginStore!.setIsAuthenticated(true);
            } else {
                // TODO: this message should be visible to user
                this.props.errorStore!
                    .addError('Kirjautuminen epäonnistui. Väärä käyttäjätunnus tai salasana.');
            }
        });
    }

    public render() {
        const { from } = this.props.location!.state || { from: { pathname: '/' } };
        if (this.props.loginStore!.isAuthenticated) {
            return <Redirect to={from} />;
        }

        return (
        <div className={s.loginView}>
            <img className={s.backgroundImage} src={loginBackground} />
            <div className={s.wrapper}>
                <div className={s.header}>
                    <img className={s.logo} src={hslLogo} alt='HSL Logo'/>
                    <h2>Joukkoliikennerekisteri</h2>
                </div>
                <form className={s.form}>
                    <input
                        type='text'
                        placeholder='Käyttäjätunnus'
                    />
                    <input
                        type='password'
                        placeholder='Salasana'
                    />
                    <label className={s.checkboxContainer}>
                        <input className={s.checkbox} type='checkbox'/>
                        Muista minut
                    </label>
                </form>
                <div
                    className={s.button}
                    onClick={this.login}
                >
                    Kirjaudu
                </div>
            </div>
        </div>
        );
    }
}

export default Login;
