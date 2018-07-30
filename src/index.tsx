import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import './index.css';
import observableLoginStore from './stores/loginStore';
import observableMapStore from './stores/mapStore';
import observableSidebarStore from './stores/sidebarStore';
import apolloClient from './util/ApolloClient';

configure({ enforceActions: 'strict' });

ReactDOM.render(
    <Provider
      mapStore={observableMapStore}
      sidebarStore={observableSidebarStore}
      loginStore={observableLoginStore}
    >
        <ApolloProvider client={apolloClient}>
          <App/>
        </ApolloProvider>
    </Provider>,
    document.getElementById('root') as HTMLElement,
);
