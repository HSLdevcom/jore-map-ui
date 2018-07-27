import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LoginStore } from '../../stores/loginStore';
import './LoginModal.css';

interface ILoginModalProps {
    loginStore?: LoginStore;
}

@inject('loginStore')
@observer
class LoginModal extends React.Component<ILoginModalProps> {
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
    }

    public render(): any {
        return (
        <div className='loginModal'>
          <div className='loginModal-content'>
            <h2 id='title'>Sisäänkirjautuminen</h2>
              <form>
                <label className='loginModal-label'>
                  Tunnus<br/>
                  <input
                    className='login-input'
                    type='text'
                    onChange={this.handleUserNameOnChange}
                  />
                </label>
                <label className='loginModal-label'>
                  Salasana<br/>
                  <input
                    className='login-input'
                    type='text'
                    onChange={this.handlePasswordOnChange}
                  />
                </label>
              </form>
            <div className='modal-button-bar'>
              <button
                className='modal-cancel-button'
                onClick={this.closeLoginModal}
              >
                Peruuta
              </button>
              <div className='button-divider'/>
              <button
                className='modal-login-button'
              >
                Kirjaudu
              </button>
            </div>
          </div>
        </div>
        );
    }
}

export default LoginModal;
