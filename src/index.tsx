import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import ReactDOM from 'react-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router';
import App from './components/App';
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
import NodeStore from './stores/nodeStore';
import LinkStore from './stores/linkStore';
import DialogStore from './stores/dialogStore';
import apolloClient from './util/ApolloClient';
import navigator from './routing/navigator';
import './index.scss';

configure({ enforceActions: 'always' });

const browserHistory = createBrowserHistory();

// Observable stores
const stores = {
    errorStore: ErrorStore,
    mapStore: MapStore,
    searchResultStore: SearchResultStore,
    loginStore: LoginStore,
    routeStore: RouteStore,
    routePathStore: RoutePathStore,
    searchStore: SearchStore,
    popupStore: PopupStore,
    toolbarStore: ToolbarStore,
    networkStore: NetworkStore,
    nodeStore: NodeStore,
    linkStore: LinkStore,
    dialogStore: DialogStore,
};

const history = syncHistoryWithStore(browserHistory, navigator.getStore());

ReactDOM.render(
    <Provider {...stores}>
        <ApolloProvider client={apolloClient.getClient()}>
            <Router history={history}>
                <App />
            </Router>
        </ApolloProvider>
    </Provider>,
    document.getElementById('root') as HTMLElement,
);
