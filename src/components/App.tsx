import { inject, observer } from 'mobx-react';
import React from 'react';
import { matchPath, withRouter, Switch } from 'react-router';
import { Route, RouteComponentProps } from 'react-router-dom';
import constants from '~/constants/constants';
import endpoints from '~/enums/endpoints';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import AuthService, { IAuthorizationResponse } from '~/services/authService';
import CodeListService from '~/services/codeListService';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import ApiClient from '~/util/ApiClient';
import '~/util/KeyEventHandler';
import LocalStorageHelper from '~/util/LocalStorageHelper';
import ErrorBar from './ErrorBar';
import NavigationBar from './NavigationBar';
import * as s from './app.scss';
import Login from './login/Login';
import Map from './map/Map';
import OverlayContainer from './overlays/OverlayContainer';
import Sidebar from './sidebar/Sidebar';

interface IAppState {
    isLoginInProgress: boolean;
}

interface IAppProps extends RouteComponentProps<any> {
    loginStore?: LoginStore;
    mapStore?: MapStore;
    codeListStore?: CodeListStore;
    errorStore?: ErrorStore;
}

@inject('mapStore', 'loginStore', 'codeListStore', 'errorStore')
@observer
class App extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps) {
        super(props);
        this.state = {
            isLoginInProgress: true
        };
    }

    componentDidMount() {
        this.init();
    }

    private renderApp = (isMapFullscreen: boolean) => {
        this.initCodeLists();

        return (
            <>
                <NavigationBar />
                <div className={s.appContent}>
                    <div className={isMapFullscreen ? s.hidden : ''}>
                        <Sidebar location={this.props.location} />
                    </div>
                    <Map>
                        <ErrorBar />
                    </Map>
                </div>
                <OverlayContainer />
            </>
        );
    };

    private initCodeLists = async () => {
        try {
            const codeLists = await CodeListService.fetchAllCodeLists();
            this.props.codeListStore!.setCodeListItems(codeLists);
        } catch (e) {
            this.props.errorStore!.addError('Koodiston haku epäonnistui', e);
        }
    };

    private init = async () => {
        const isAfterLogin = Boolean(matchPath(navigator.getPathName(), SubSites.afterLogin));
        if (!isAfterLogin && constants.IS_LOGIN_REQUIRED) {
            const response = (await ApiClient.getRequest(
                endpoints.EXISTING_SESSION
            )) as IAuthorizationResponse;
            if (response.isOk) {
                // Auth was ok, keep the current site as it is
                this.props.loginStore!.setAuthenticationInfo(response);
            } else {
                // Redirect to login
                LocalStorageHelper.setItem('origin_url', navigator.getFullPath());
                navigator.goTo(SubSites.login);
            }
        }

        this.setState({
            isLoginInProgress: false
        });
    };

    private renderAfterLogin = () => {
        AuthService.authenticate(
            () => {
                // On success: Redirecting user to where she left off.
                const originUrl = LocalStorageHelper.getItem('origin_url');
                const destination = originUrl ? originUrl : SubSites.home;
                LocalStorageHelper.removeItem('origin_url');
                navigator.goTo(destination);
            },
            () => {
                // On error
                navigator.goTo(SubSites.login);
                AuthService.logout();
                return null;
            }
        );
        return <div>Kirjaudutaan sisään...</div>;
    };

    render() {
        if (this.state.isLoginInProgress) {
            return <div>Ladataan sovellusta...</div>;
        }

        const isMapFullscreen = this.props.mapStore!.isMapFullscreen;
        return (
            <div className={s.appView}>
                <Switch>
                    <Route exact={true} path={SubSites.afterLogin} render={this.renderAfterLogin} />
                    <Route path='/login' component={Login} />
                    <Route component={() => this.renderApp(isMapFullscreen)} />
                </Switch>
            </div>
        );
    }
}

export default withRouter(App);
