import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { LoginStore } from '~/stores/loginStore';
import { SidebarStore } from '~/stores/sidebarStore';
import { MapStore } from '~/stores/mapStore';
import { NotificationStore } from '~/stores/notificationStore';
import ButtonType from '~/enums/buttonType';
import NotificationWindow from './NotificationWindow';
import Button from './controls/Button';
import Modal from './Modal';
import Login from './login/Login';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
import * as s from './app.scss';

interface IAppState {
    showLogin: boolean;
}

interface IAppProps extends RouteComponentProps<any> {
    loginStore?: LoginStore;
    sidebarStore?: SidebarStore;
    mapStore?: MapStore;
    notificationStore?: NotificationStore;
}

@inject('mapStore', 'sidebarStore', 'loginStore', 'notificationStore')
@observer
class App extends React.Component<IAppProps, IAppState> {
    private openLoginForm = () => {
        this.props.loginStore!.showLogin = true;
    }

    private closeLoginModal = () => {
        this.props.loginStore!.showLogin = false;
    }

    public render(): any {
        const sidebarHiddenClass = this.props.mapStore!.isMapFullscreen ? s.hidden : '';
        return (
            <div className={s.appView}>
                <Modal
                    closeModal={this.closeLoginModal}
                    isVisible={this.props.loginStore!.showLogin}
                >
                    <Login />
                </Modal>
                <div className={sidebarHiddenClass}>
                    <Sidebar
                        location={this.props.location}
                    />
                </div>
                <Map/>
                <Button
                  onClick={this.openLoginForm}
                  className={s.loginButton}
                  type={ButtonType.SECONDARY}
                  text='Kirjaudu'
                />
                <NotificationWindow
                    notifications={this.props.notificationStore!.notifications}
                />
            </div>
        );
    }
}

export default withRouter(App);
