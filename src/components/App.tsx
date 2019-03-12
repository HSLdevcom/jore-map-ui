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
import * as localStorageHelper from '~/util/localStorageHelper';
import ErrorBar from './ErrorBar';
import Dialog from './Dialog';
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
}

@inject('mapStore', 'loginStore')
@observer
class App extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps) {
        super(props);
        this.state = {
            isLoginInProgress: true,
        };
    }

    componentWillMount() {
        this.redirectToLogin();
    }

    private redirectToLogin = async () => {
        const isAfterLogin = Boolean(matchPath(navigator.getPathName(), SubSites.afterLogin));
        if (!isAfterLogin) {
            const response = (await ApiClient
                .getRequest(endpoints.EXISTING_SESSION) as IAuthorizationResponse);
            if (response.isOk) {
                // Auth was ok, keep the current site as it is
                this.props.loginStore!.setAuthenticationInfo(response);
            } else {
                // Redirect to login
                localStorageHelper.setOriginUrl(navigator.getFullPath());
                navigator.goTo(SubSites.login);
            }
        }
        this.setState({
            isLoginInProgress: false,
        });
    }

    private renderApp = () => (
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
            <Dialog />
        </>
    )

    private renderAfterLogin = () => {
        AuthService.authenticate(
        () => {
            // On success: Redirecting user to where she left off.
            const originUrl = localStorageHelper.getOriginUrl();
            const destination = originUrl ? originUrl : SubSites.home;
            localStorageHelper.clearOriginUrl();
            navigator.goTo(destination);
        },
        () => {
            // On error
            navigator.goTo(SubSites.loginError);
        });
        return (<div>Logging in</div>);
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
                        path='/'
                        component={this.renderApp}
                    />
                </Switch>
            </div>
        );
    }
}

export default withRouter(App);
