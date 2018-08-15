import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { NotificationStore } from '../stores/notificationStore';
import { LoginStore } from '../stores/loginStore';
import { SidebarStore } from '../stores/sidebarStore';
import Button from './controls/Button';
import ButtonType from '../enums/buttonType';
import NotificationWindow from './NotificationWindow';
import Modal from './Modal';
import Login from './login/Login';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
import NodeWindow from './NodeWindow';
import * as s from './app.scss';
const rootPath: string = '/';

interface IAppState {
    showLogin: boolean;
}

interface IAppProps {
    notificationStore?: NotificationStore;
    loginStore?: LoginStore;
    sidebarStore?: SidebarStore;
}

@inject('notificationStore')
@inject('sidebarStore')
@inject('loginStore')
@observer
class App extends React.Component<IAppProps, IAppState> {

    private openLoginForm = () => {
        this.props.loginStore!.showLogin = true;
    }

    private closeLoginModal = () => {
        this.props.loginStore!.showLogin = false;
    }

    private closeNodeWindow = () => {
        this.props.sidebarStore!.setOpenedNodeId(null);
    }

    public render(): any {
        return (
            <Router>
              <div className={s.appView}>
                <Map/>
                <Button
                    onClick={this.openLoginForm}
                    className={s.loginButton}
                    type={ButtonType.SECONDARY}
                    text='Kirjaudu'
                />
                <Modal
                    closeModal={this.closeLoginModal}
                    isVisible={this.props.loginStore!.showLogin}
                >
                    <Login />
                </Modal>
                <Modal
                    closeModal={this.closeNodeWindow}
                    isVisible={this.props.sidebarStore!.showNodeWindow}
                >
                    <NodeWindow />
                </Modal>
                <Sidebar />
                <Route
                    exact={true}
                    path='/'
                    rootPath={rootPath}
                />
                <NotificationWindow
                  notifications={this.props.notificationStore!.notifications}
                />
              </div>
            </Router>
        );
    }
}

export default App;
