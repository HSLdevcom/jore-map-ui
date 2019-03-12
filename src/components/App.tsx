import { inject, observer } from 'mobx-react';
import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { withRouter, Switch } from 'react-router';
import '~/util/KeyEventHandler';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import SubSites from '~/routing/subSites';
import AuthService from '~/services/authService';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import ErrorBar from './ErrorBar';
import Dialog from './Dialog';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
import PrivateRoute from './PrivateRoute';
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
            const a = navigator.getQueryParam(QueryParams.state);
            const b = a.replace('$', '=');
            // on success
            navigator.goTo(b);
        },
        () => {
            // On error
            navigator.goTo(SubSites.loginError);
        });
        return (<div>Logging in</div>);
    }

    render() {
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
                    <PrivateRoute
                        path='/'
                        component={this.renderApp}
                    />
                </Switch>
            </div>
        );
    }
}

export default withRouter(App);
