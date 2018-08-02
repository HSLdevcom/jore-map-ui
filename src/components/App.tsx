import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { LoginStore } from '../stores/loginStore';
import Button from './controls/Button';
import ButtonType from '../enums/buttonType';
import Modal from './Modal';
import Login from './login/Login';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
import './app.scss';
const rootPath: string = '/';

interface IAppState {
    showLogin: boolean;
}

interface IAppProps {
    loginStore?: LoginStore;
}

@inject('loginStore')
@observer
class App extends React.Component<IAppProps, IAppState> {

    private openLoginForm = () => {
        this.props.loginStore!.showLogin = true;
    }

    private closeLoginModal = () => {
        this.props.loginStore!.showLogin = false;
    }

    public render(): any {
        return (
            <Router>
              <div className={'app-container'}>
                <Map/>
                <Button
                    onClick={this.openLoginForm}
                    className={'login-button'}
                    type={ButtonType.SECONDARY}
                    text={'Kirjaudu'}
                />
                <Modal
                    closeModal={this.closeLoginModal}
                    isVisible={this.props.loginStore!.showLogin}
                >
                    <Login />
                </Modal>
                <Sidebar />
                <Route
                    exact={true}
                    path='/'
                    rootPath={rootPath}
                />
              </div>
            </Router>
        );
    }
}

export default App;
