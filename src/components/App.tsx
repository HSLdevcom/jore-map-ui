import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LoginStore } from '../stores/loginStore';
import { NotificationStore } from '../stores/notificationStore';
import { SidebarStore } from '../stores/sidebarStore';
import { MapStore } from '../stores/mapStore';
import Button from './controls/Button';
import ButtonType from '../enums/buttonType';
import NotificationWindow from './NotificationWindow';
import Modal from './Modal';
import Login from './login/Login';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
import NodeWindow from './NodeWindow';
import * as s from './app.scss';
import { Route, RouteComponentProps } from 'react-router-dom';
import { LineStore } from '../stores/lineStore';
import LineService from '../services/lineService';
import RouteService from '../services/routeService';
import { RouteStore } from '../stores/routeStore';
import * as qs from 'qs';

interface IAppState {
    showLogin: boolean;
}

interface IAppProps extends RouteComponentProps<any> {
    notificationStore?: NotificationStore;
    loginStore?: LoginStore;
    sidebarStore?: SidebarStore;
    mapStore?: MapStore;
    lineStore?: LineStore;
    routeStore?: RouteStore;
}

@inject('mapStore', 'notificationStore', 'sidebarStore', 'loginStore', 'lineStore', 'routeStore')
@observer
class App extends React.Component<IAppProps, IAppState> {

    componentDidMount() {
        this.queryAll();
    }
    componentWillReceiveProps(props: any) {
        this.queryAll();
    }

    async queryAll() {
        this.props.sidebarStore!.isLoading = true;
        await this.queryAllLines();
        await this.queryRoutes();
        this.props.sidebarStore!.isLoading = false;
    }

    async queryAllLines() {
        try {
            await this.props.lineStore!.setAllLines(await LineService.getAllLines());
        } catch (err) {
            // TODO: show error on screen that the query failed
        }
    }
    private async queryRoutes() {
        this.props.lineStore!.setSearchInput('');
        const queryValues = qs.parse(this.props.location.search,
                                     { ignoreQueryPrefix: true, arrayLimit: 1 },
        );
        let routeIds: string[] = [];
        if (queryValues.routes) {
            routeIds = queryValues.routes.split(' ');
            this.props.routeStore!.routes = await RouteService.getRoutes(routeIds);
        }

    }

    private openLoginForm = () => {
        this.props.loginStore!.showLogin = true;
    }

    private closeLoginModal = () => {
        this.props.loginStore!.showLogin = false;
    }

    private closeNodeWindow = () => {
        this.props.sidebarStore!.setOpenedNodeId(null);
    }

    public render(): any {
        const sidebarHiddenClass = this.props.mapStore!.isMapFullscreen ? s.hidden : '';
        return (
          <div className={s.appView}>
            <Map/>
            <Button
                onClick={this.openLoginForm}
                className={s.loginButton}
                type={ButtonType.SECONDARY}
                text='Kirjaudu'
            />
            <Modal
                closeModal={this.closeLoginModal}
                isVisible={this.props.loginStore!.showLogin}
            >
                <Login />
            </Modal>
            <Modal
                closeModal={this.closeNodeWindow}
                isVisible={this.props.sidebarStore!.showNodeWindow}
            >
                <NodeWindow />
            </Modal>
            <div className={sidebarHiddenClass}>
                <Route component={Sidebar} />
            </div>
            <NotificationWindow
              notifications={this.props.notificationStore!.notifications}
            />
          </div>
        );
    }
}

export default App;
