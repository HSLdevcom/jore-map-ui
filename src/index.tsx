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
import LineStore from './stores/lineStore';
import LineTopicStore from './stores/lineTopicStore';
import RouteStore from './stores/routeStore';
import RouteListStore from './stores/routeListStore';
import RoutePathStore from './stores/routePathStore';
import RoutePathCopySegmentStore from './stores/routePathCopySegmentStore';
import SearchStore from './stores/searchStore';
import PopupStore from './stores/popupStore';
import ErrorStore from './stores/errorStore';
import ToolbarStore from './stores/toolbarStore';
import NetworkStore from './stores/networkStore';
import CodeListStore from './stores/codeListStore';
import NodeStore from './stores/nodeStore';
import LinkStore from './stores/linkStore';
import AlertStore from './stores/alertStore';
import ConfirmStore from './stores/confirmStore';
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
    lineStore: LineStore,
    lineTopicStore: LineTopicStore,
    routeStore: RouteStore,
    routeListStore: RouteListStore,
    routePathStore: RoutePathStore,
    routePathCopySegmentStore: RoutePathCopySegmentStore,
    searchStore: SearchStore,
    popupStore: PopupStore,
    toolbarStore: ToolbarStore,
    networkStore: NetworkStore,
    nodeStore: NodeStore,
    linkStore: LinkStore,
    alertStore: AlertStore,
    codeListStore: CodeListStore,
    confirmStore: ConfirmStore
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
    document.getElementById('root') as HTMLElement
);
