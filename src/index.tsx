import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router';
import App from './components/App';
import NotificationStore from './stores/notificationStore';
import LoginStore from './stores/loginStore';
import MapStore from './stores/mapStore';
import LineStore from './stores/lineStore';
import RouteStore from './stores/routeStore';
import NewRoutePathStore from './stores/new/newRoutePathStore';
import SearchStore from './stores/searchStore';
import SidebarStore from './stores/sidebarStore';
import SelectionStore from './stores/selectionStore';
import PopupStore from './stores/popupStore';
import ToolbarStore from './stores/toolbarStore';
import NetworkStore from './stores/networkStore';
import apolloClient from './util/ApolloClient';
import navigator from './routing/navigator';
import './index.scss';

configure({ enforceActions: 'always' });

const browserHistory = createBrowserHistory();

// Observable stores
const stores = {
    mapStore: MapStore,
    notificationStore: NotificationStore,
    lineStore: LineStore,
    loginStore: LoginStore,
    routeStore: RouteStore,
    newRoutePathStore: NewRoutePathStore,
    searchStore: SearchStore,
    sidebarStore: SidebarStore,
    popupStore: PopupStore,
    toolbarStore: ToolbarStore,
    networkStore: NetworkStore,
    selectionStore: SelectionStore,
};

const history = syncHistoryWithStore(browserHistory, navigator.getStore());

ReactDOM.render(
    <Provider {...stores}>
        <ApolloProvider client={apolloClient}>
            <Router history={history}>
                <App />
            </Router>
        </ApolloProvider>
    </Provider>,
    document.getElementById('root') as HTMLElement,
);
