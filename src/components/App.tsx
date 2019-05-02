import { inject, observer } from 'mobx-react';
import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { matchPath, withRouter, Switch } from 'react-router';
import '~/util/KeyEventHandler';
import endpoints from '~/enums/endpoints';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import SubSites from '~/routing/subSites';
import AuthService, { IAuthorizationResponse } from '~/services/authService';
import ApiClient from '~/util/ApiClient';
import navigator from '~/routing/navigator';
import constants from '~/constants/constants';
import CodeListService from '~/services/codeListService';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import * as localStorageHelper from '~/util/localStorageHelper';
import OverlayController from './overlays/OverlayController';
import ErrorBar from './ErrorBar';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
import Login from './login/Login';
import NavigationBar from './NavigationBar';
import * as s from './app.scss';

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
            isLoginInProgress: true,
        };
    }

    componentDidMount() {
        this.init();
    }

    private renderApp = () => {
        this.initCodeLists();

        return (
            <>
                <NavigationBar />
                    <div className={s.appContent}>
                        <div className={this.props.mapStore!.isMapFullscreen ? s.hidden : ''}>
                            <Sidebar
                                location={this.props.location}
                            />
                        </div>
                        <Map>
                            <ErrorBar />
                        </Map>
                    </div>
                    <OverlayController />
                </>
        );
    }

    private initCodeLists = async () => {
        try {
            const codeLists = await CodeListService.fetchAllCodeLists();
            this.props.codeListStore!.setCodeListItems(codeLists);
        } catch (e) {
            this.props.errorStore!.addError('Koodiston haku epäonnistui', e);
        }
    }

    private init = async () => {
        const isAfterLogin = Boolean(matchPath(navigator.getPathName(), SubSites.afterLogin));
        if (!isAfterLogin && constants.IS_LOGIN_REQUIRED) {
            const response = await ApiClient
                .getRequest(endpoints.EXISTING_SESSION) as IAuthorizationResponse;
            if (response.isOk) {
                // Auth was ok, keep the current site as it is
                this.props.loginStore!.setAuthenticationInfo(response);

            } else {
                // Redirect to login
                localStorageHelper.setItem('origin_url', navigator.getFullPath());
                navigator.goTo(SubSites.login);
            }
        }

        this.setState({
            isLoginInProgress: false,
        });
    }

    private renderAfterLogin = () => {
        AuthService.authenticate(
        () => {
            // On success: Redirecting user to where she left off.
            const originUrl = localStorageHelper.getItem('origin_url');
            const destination = originUrl ? originUrl : SubSites.home;
            localStorageHelper.clearItem('origin_url');
            navigator.goTo(destination);
        },
        () => {
            // On error
            navigator.goTo(SubSites.loginError);
        });
        return (<div>Kirjaudutaan sisään...</div>);
    }

    render() {
        if (this.state.isLoginInProgress) return <div>Ladataan sovellusta...</div>;

        return (
            <div className={s.appView}>
                <Switch>
                    <Route
                        exact={true}
                        path={SubSites.afterLogin}
                        render={this.renderAfterLogin}
                    />
                    <Route
                        path='/login'
                        component={Login}
                    />
                    <Route
                        component={this.renderApp}
                    />
                </Switch>
            </div>
        );
    }
}

export default withRouter(App);
