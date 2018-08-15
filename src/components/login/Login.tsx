import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { NotificationStore } from '../../stores/notificationStore';
import { LoginStore } from '../../stores/loginStore';
import Button from '../controls/Button';
import ButtonType from '../../enums/buttonType';
import * as s from './login.scss';

interface ILoginProps {
    notificationStore?: NotificationStore;
    loginStore?: LoginStore;
}

@inject('notificationStore')
@inject('loginStore')
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
        this.props.notificationStore!.addNotification(
            {
                message: 'Kirjautuminen ei käytössä.',
                type: 'warning',
            },
        );
    }

    public render(): any {
        return (
        <div className={s.loginView}>
            <h2>Sisäänkirjautuminen</h2>
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
                    type={ButtonType.SECONDARY}
                    text={'Peruuta'}
                />
                <Button
                    onClick={this.closeLoginModal}
                    type={ButtonType.PRIMARY}
                    text={'Kirjaudu'}
                />
            </div>
        </div>
        );
    }
}

export default Login;
