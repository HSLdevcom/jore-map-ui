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
import ErrorBar from './ErrorBar';
import Dialog from './Dialog';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
import packageVersion from '../project/version.json';
import PrivateRoute from './PrivateRoute';
import Login from './login/Login';
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
    private renderApp = () => {
        const sidebarHiddenClass = this.props.mapStore!.isMapFullscreen ? s.hidden : '';
        const buildDate = process.env.BUILD_DATE;
        const buildDateInfo = buildDate ? `Date: ${buildDate}` : '';
        return (
            <>
                <div className={s.buildInfo}>
                    {`Build: ${packageVersion.version} ${buildDateInfo}`}
                </div>
                <div className={sidebarHiddenClass}>
                    <Sidebar
                        location={this.props.location}
                    />
                </div>
                <Map>
                    <ErrorBar />
                </Map>
                <Dialog />
            </>
        );
    }

    private renderAfterLogin = () => {
        AuthService.authenticate(
        () => {
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
