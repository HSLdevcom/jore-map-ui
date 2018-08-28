import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import { NotificationStore } from '../stores/notificationStore';
import { LoginStore } from '../stores/loginStore';
import { SidebarStore } from '../stores/sidebarStore';
import { MapStore } from '../stores/mapStore';
import Button from './controls/Button';
import ButtonType from '../enums/buttonType';
import NotificationWindow from './NotificationWindow';
import Modal from './Modal';
import Login from './login/Login';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
import NodeWindow from './NodeWindow';
import { Route } from 'react-router';

import * as s from './app.scss';
const rootPath: string = '/';

interface IAppState {
    showLogin: boolean;
}

interface IAppProps {
    notificationStore?: NotificationStore;
    loginStore?: LoginStore;
    sidebarStore?: SidebarStore;
    mapStore?: MapStore;
}

@inject('mapStore')
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
        const sidebarHiddenClass = this.props.mapStore!.isMapFullscreen ? s.hidden : '';
        return (
            <BrowserRouter>
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
                <div className={sidebarHiddenClass}>
                    <Switch>
                        <Route component={Sidebar} />
                    </Switch>
                </div>
                <Route
                    exact={true}
                    path='/'
                    rootPath={rootPath}
                />
                <NotificationWindow
                  notifications={this.props.notificationStore!.notifications}
                />
              </div>
            </BrowserRouter>
        );
    }
}

export default App;
