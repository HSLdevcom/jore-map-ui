import React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import { Location } from 'history';
import constants from '~/constants/constants';
import hslLogo from '~/assets/hsl-logo.png';
import SubSites from '~/routing/subSites';
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
    private openLoginForm = () => {
        window.location.replace(
            // TODO: split into parts & move into constants
            // tslint:disable-next-line
            `https://hslid-uat.cinfra.fi/openid/auth?client_id=6549375356227079&redirect_uri=${constants.AFTER_LOGIN_URL}&response_type=code&scope=email+https://oneportal.trivore.com/scope/groups.readonly`
        );
    }

    public render() {
        if (this.props.loginStore!.isAuthenticated) {
            return <Redirect to={SubSites.home} />;
        }

        return (
        <div className={s.loginView}>
            <div className={s.wrapper}>
                <div className={s.header}>
                    <img className={s.logo} src={hslLogo} alt='HSL Logo'/>
                    <h2>Joukkoliikennerekisteri</h2>
                </div>
                <div
                    className={s.loginButton}
                    onClick={this.openLoginForm}
                >
                    <FaLock />
                    <div className={s.loginText}>Kirjaudu (HSL ID)</div>
                </div>
            </div>
        </div>
        );
    }
}

export default Login;
