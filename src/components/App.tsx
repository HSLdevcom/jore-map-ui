import { inject, observer } from 'mobx-react';
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import ButtonType from '~/enums/buttonType';
import ErrorBar from './ErrorBar';
import Dialog from './Dialog';
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
    mapStore?: MapStore;
}

@inject('mapStore', 'loginStore')
@observer
class App extends React.Component<IAppProps, IAppState> {
    private openLoginForm = () => {
        window.location.replace(
            // tslint:disable-next-line
            'https://hslid-uat.cinfra.fi/openid/auth?client_id=6549375356227079&redirect_uri=http://localhost:3000/after_login&response_type=code&scope=email'
        );
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
                    <ErrorBar />
                </Map>
                <Button
                  onClick={this.openLoginForm}
                  className={s.loginButton}
                  type={ButtonType.SQUARE_SECONDARY}
                >
                    Kirjaudu
                </Button>
                <Dialog />
            </div>
        );
    }
}

export default withRouter(App);
