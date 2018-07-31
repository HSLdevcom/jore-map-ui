import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { LoginStore } from '../stores/loginStore';
import OpenLoginFormButton from './controls/OpenLoginFormButton';
import Modal from './Modal';
import Login from './login/Login';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
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

    private closeLoginModal = () => {
        this.props.loginStore!.showLogin = false;
    }

    public render(): any {
        return (
            <Router>
              <div className={'app-container'}>
                <Map/>
                <OpenLoginFormButton/>
                <Modal
                    closeModal={this.closeLoginModal}
                    isVisible={this.props.loginStore!.showLogin}
                >
                    <Login />
                </Modal>
                <Sidebar />
                <Route exact={true} path='/' rootPath={rootPath}/>
              </div>
            </Router>
        );
    }
}

export default App;
