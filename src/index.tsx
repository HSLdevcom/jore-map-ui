import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import ReactDOM from 'react-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router';
import App from './components/App';
import NotificationStore from './stores/notificationStore';
import LoginStore from './stores/loginStore';
import MapStore from './stores/mapStore';
import SearchResultStore from './stores/searchResultStore';
import RouteStore from './stores/routeStore';
import RoutePathStore from './stores/routePathStore';
import SearchStore from './stores/searchStore';
import PopupStore from './stores/popupStore';
import ErrorStore from './stores/errorStore';
import ToolbarStore from './stores/toolbarStore';
import NetworkStore from './stores/networkStore';
import GeometryEventStore from './stores/geometryEventStore';
import EditNetworkStore from './stores/editNetworkStore';
import apolloClient from './util/ApolloClient';
import navigator from './routing/navigator';
import './index.scss';

configure({ enforceActions: 'always' });

const browserHistory = createBrowserHistory();

// Observable stores
const stores = {
    errorStore: ErrorStore,
    mapStore: MapStore,
    notificationStore: NotificationStore,
    searchResultStore: SearchResultStore,
    loginStore: LoginStore,
    routeStore: RouteStore,
    routePathStore: RoutePathStore,
    searchStore: SearchStore,
    popupStore: PopupStore,
    toolbarStore: ToolbarStore,
    networkStore: NetworkStore,
    geometryEventStore: GeometryEventStore,
    editNetworkStore: EditNetworkStore,
};

const history = syncHistoryWithStore(browserHistory, navigator.getStore());

window.onerror = (msg, url, lineNo, columnNo, error) => {
    ErrorStore.error = `${error}`;
    return true;
};

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
