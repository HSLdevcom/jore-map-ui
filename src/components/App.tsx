import { createBrowserHistory } from 'history';
import { inject, observer } from 'mobx-react';
import { syncHistoryWithStore } from 'mobx-react-router';
import React from 'react';
import { matchPath, Router, Switch } from 'react-router';
import { Route } from 'react-router-dom';
import EndpointPath from '~/enums/endpointPath';
import LocalStorageHelper from '~/helpers/LocalStorageHelper';
import navigator from '~/routing/navigator';
import SubSites from '~/routing/subSites';
import AuthService, { IAuthorizationResponse } from '~/services/authService';
import CodeListService from '~/services/codeListService';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import HttpUtils from '~/utils/HttpUtils';
import '~/utils/KeyEventHandler';
import AppFrame from './AppFrame';
import * as s from './app.scss';
import Login from './login/Login';

interface IAppState {
    isLoginInProgress: boolean;
    isCodeListQueryInProgress: boolean;
}

interface IAppProps {
    loginStore?: LoginStore;
    mapStore?: MapStore;
    codeListStore?: CodeListStore;
    errorStore?: ErrorStore;
}

const browserHistory = createBrowserHistory();
const history = syncHistoryWithStore(browserHistory, navigator.getStore());

@inject('mapStore', 'loginStore', 'codeListStore', 'errorStore')
@observer
class App extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps) {
        super(props);
        this.state = {
            isLoginInProgress: true,
            isCodeListQueryInProgress: true
        };
    }

    componentDidMount() {
        this.initLogin();
    }

    private initLogin = async () => {
        const isAfterLogin = Boolean(matchPath(navigator.getPathName(), SubSites.afterLogin));
        if (!isAfterLogin) {
            const response = (await HttpUtils.getRequest(
                EndpointPath.EXISTING_SESSION
            )) as IAuthorizationResponse;
            if (response.isOk) {
                // Auth was ok, keep the current site as it is
                this.props.loginStore!.setAuthenticationInfo(response);
                this.initApp();
            } else {
                // Redirect to login
                LocalStorageHelper.setItem('origin_url', navigator.getFullPath());
                navigator.goTo({ link: SubSites.login });
            }
        }

        this.setState({
            isLoginInProgress: false
        });
    };

    private initApp = () => {
        this.initCodeLists();
        this.fetchSaveLock();
    };

    private initCodeLists = async () => {
        try {
            const codeLists = await CodeListService.fetchAllCodeLists();
            this.props.codeListStore!.setCodeListItems(codeLists);
            this.setState({
                isCodeListQueryInProgress: false
            });
        } catch (e) {
            this.props.errorStore!.addError('Koodiston haku epäonnistui', e);
        }
    };

    private fetchSaveLock = async () => {
        const isSaveLockEnabled = await AuthService.fetchIsSaveLockEnabled();
        this.props.loginStore!.setIsSaveLockEnabled(isSaveLockEnabled);
    };

    private renderAfterLogin = () => {
        AuthService.authenticate(
            () => {
                // On success: Redirecting user to where she left off.
                const originUrl = LocalStorageHelper.getItem('origin_url');
                const destination = originUrl ? originUrl : SubSites.home;
                LocalStorageHelper.removeItem('origin_url');
                navigator.goTo({ link: destination });
                this.initApp();
            },
            () => {
                // On error
                navigator.goTo({ link: SubSites.login });
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

        return (
            <div className={s.appView}>
                <Router history={history}>
                    <Switch>
                        <Route
                            exact={true}
                            path={SubSites.afterLogin}
                            render={this.renderAfterLogin}
                        />
                        <Route path='/login' component={Login} />
                        <Route path={'*'} component={AppFrame} />
                    </Switch>
                </Router>
            </div>
        );
    }
}

export default App;
