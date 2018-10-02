import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router';
import App from './components/App';
import observableNotificationStore from './stores/notificationStore';
import observableLoginStore from './stores/loginStore';
import observableMapStore from './stores/mapStore';
import observableLineStore from './stores/lineStore';
import observableRouteStore from './stores/routeStore';
import observableSearchStore from './stores/searchStore';
import observableSidebarStore from './stores/sidebarStore';
import observablePopupStore from './stores/popupStore';
import observableToolbarStore from './stores/toolbarStore';
import observableNodeStore from './stores/nodeStore';
import observableNetworkStore from './stores/networkStore';
import apolloClient from './util/ApolloClient';
import navigator from './routing/navigator';
import './index.scss';

configure({ enforceActions: 'always' });

const browserHistory = createBrowserHistory();

const stores = {
    mapStore: observableMapStore,
    notificationStore: observableNotificationStore,
    lineStore: observableLineStore,
    loginStore: observableLoginStore,
    routeStore: observableRouteStore,
    searchStore: observableSearchStore,
    sidebarStore: observableSidebarStore,
    popupStore: observablePopupStore,
    toolbarStore: observableToolbarStore,
    nodeStore: observableNodeStore,
    networkStore: observableNetworkStore,
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
