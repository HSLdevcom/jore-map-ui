import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LoginStore } from '../stores/loginStore';
import { NotificationStore } from '../stores/notificationStore';
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
import * as s from './app.scss';
import { Route, RouteComponentProps } from 'react-router-dom';

interface IAppState {
    showLogin: boolean;
}

interface IAppProps extends RouteComponentProps<any> {
    notificationStore?: NotificationStore;
    loginStore?: LoginStore;
    sidebarStore?: SidebarStore;
    mapStore?: MapStore;
}

@inject('mapStore', 'notificationStore', 'sidebarStore', 'loginStore')
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
                <Route component={Sidebar} />
            </div>
            <NotificationWindow
              notifications={this.props.notificationStore!.notifications}
            />
          </div>
        );
    }
}

export default App;
