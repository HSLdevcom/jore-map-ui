import { inject, observer } from 'mobx-react';
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import { ErrorStore } from '~/stores/errorStore';
import { NotificationStore } from '~/stores/notificationStore';
import ButtonType from '~/enums/buttonType';
import NotificationWindow from './NotificationWindow';
import Button from './controls/Button';
import Modal from './Modal';
import Login from './login/Login';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
import packageVersion from '../project/version.json';
import * as s from './app.scss';

interface IAppState {
    showLogin: boolean;
}

interface IAppProps extends RouteComponentProps<any> {
    loginStore?: LoginStore;
    errorStore?: ErrorStore;
    mapStore?: MapStore;
    notificationStore?: NotificationStore;
}

@inject('mapStore', 'loginStore', 'notificationStore', 'errorStore')
@observer
class App extends React.Component<IAppProps, IAppState> {
    private openLoginForm = () => {
        this.props.loginStore!.showLogin = true;
    }

    private closeLoginModal = () => {
        this.props.loginStore!.showLogin = false;
    }

    render() {
        const sidebarHiddenClass = this.props.mapStore!.isMapFullscreen ? s.hidden : '';
        const buildDate = process.env.BUILD_DATE;
        const buildDateInfo = buildDate ? `Date: ${buildDate}` : '';
        return (
            <div className={s.appView}>
                <div className={s.buildInfo}>
                    {`Build: ${packageVersion.version} ${buildDateInfo}`}
                </div>
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
                <Map>
                    { !!this.props.errorStore!.error &&
                        <div className={s.errorBar}>
                            {this.props.errorStore!.error}
                        </div>
                    }
                </Map>
                <Button
                  onClick={this.openLoginForm}
                  className={s.loginButton}
                  type={ButtonType.SQUARE_SECONDARY}
                >
                    Kirjaudu
                </Button>
                <NotificationWindow
                    notifications={this.props.notificationStore!.notifications}
                />
            </div>
        );
    }
}

export default withRouter(App);
