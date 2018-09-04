import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
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
import apolloClient from './util/ApolloClient';
import './index.scss';
import { BrowserRouter, Route } from 'react-router-dom';

configure({ enforceActions: 'always' });

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
};

ReactDOM.render(
        <Provider {...stores}>
            <ApolloProvider client={apolloClient}>
                <BrowserRouter>
                    <Route component={App}/>
                </BrowserRouter>
            </ApolloProvider>
        </Provider>,
        document.getElementById('root') as HTMLElement,
);
