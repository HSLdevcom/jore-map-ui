import { inject, observer } from 'mobx-react';
import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { withRouter, Switch } from 'react-router';
import '~/util/KeyEventHandler';
import endpoints from '~/enums/endpoints';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import SubSites from '~/routing/subSites';
import AuthService, { IAuthorizationResponse } from '~/services/authService';
import ApiClient from '~/util/ApiClient';
import navigator from '~/routing/navigator';
import ErrorBar from './ErrorBar';
import Dialog from './Dialog';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
import Login from './login/Login';
import NavigationBar from './NavigationBar';
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
    async componentWillMount() {
        const pathName = navigator.getPathName();
        if (!pathName.includes(SubSites.afterLogin)) {
            const response = (await ApiClient
                .postRequest(endpoints.EXISTING_SESSION, {}) as IAuthorizationResponse);
            const { history } = this.props;
            if (response.isOk) {
                this.props.loginStore!.setAuthenticationInfo(response);
            } else {
                history.push(SubSites.login);
            }
        }
        this.props.loginStore!.setIsLoginInProgress(false);
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
            // TODO: possibly redirect to the url before user tried to access /login
            // on success
            navigator.goTo(SubSites.home);
        },
        () => {
            // On error
            navigator.goTo(SubSites.loginError);
        });
        return (<div>Logging in</div>);
    }

    render() {
        if (this.props.loginStore!.isLoginInProgress) return <div>Ladataan sovellusta...</div>;

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
