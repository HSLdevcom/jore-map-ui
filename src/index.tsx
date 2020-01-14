import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import ReactDOM from 'react-dom';
import App from './components/App';
import './index.scss';
import AlertStore from './stores/alertStore';
import CodeListStore from './stores/codeListStore';
import ConfirmStore from './stores/confirmStore';
import ErrorStore from './stores/errorStore';
import HighlightEntityStore from './stores/highlightEntityStore';
import LineHeaderMassEditStore from './stores/lineHeaderMassEditStore';
import LineStore from './stores/lineStore';
import LinkStore from './stores/linkStore';
import LoginStore from './stores/loginStore';
import MapStore from './stores/mapStore';
import NavigationStore from './stores/navigationStore';
import NetworkStore from './stores/networkStore';
import NodeStore from './stores/nodeStore';
import PopupStore from './stores/popupStore';
import RouteListStore from './stores/routeListStore';
import RoutePathCopySegmentStore from './stores/routePathCopySegmentStore';
import RoutePathStore from './stores/routePathStore';
import RouteStore from './stores/routeStore';
import SearchResultStore from './stores/searchResultStore';
import SearchStore from './stores/searchStore';
import StopAreaStore from './stores/stopAreaStore';
import ToolbarStore from './stores/toolbarStore';
import ApolloClient from './util/ApolloClient';

configure({ enforceActions: 'always' });

// Observable stores
const stores = {
    errorStore: ErrorStore,
    mapStore: MapStore,
    searchResultStore: SearchResultStore,
    loginStore: LoginStore,
    lineStore: LineStore,
    lineHeaderMassEditStore: LineHeaderMassEditStore,
    routeStore: RouteStore,
    routeListStore: RouteListStore,
    routePathStore: RoutePathStore,
    routePathCopySegmentStore: RoutePathCopySegmentStore,
    searchStore: SearchStore,
    popupStore: PopupStore,
    toolbarStore: ToolbarStore,
    networkStore: NetworkStore,
    nodeStore: NodeStore,
    stopAreaStore: StopAreaStore,
    linkStore: LinkStore,
    alertStore: AlertStore,
    codeListStore: CodeListStore,
    confirmStore: ConfirmStore,
    highlightEntityStore: HighlightEntityStore,
    navigationStore: NavigationStore
};

ReactDOM.render(
    <Provider {...stores}>
        <ApolloProvider client={ApolloClient.getClient()}>
            <App />
        </ApolloProvider>
    </Provider>,
    document.getElementById('root') as HTMLElement
);
