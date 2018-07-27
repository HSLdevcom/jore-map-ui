import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
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

configure({ enforceActions: 'strict' });

const cache = new InMemoryCache();

const client = new ApolloClient({
    cache,
    link: new HttpLink({ uri: 'http://localhost:3040/graphql' }),
});

ReactDOM.render(
    <Provider
      mapStore={observableMapStore}
      sidebarStore={observableSidebarStore}
      loginStore={observableLoginStore}
    >
        <ApolloProvider client={client}>
          <App/>
        </ApolloProvider>
    </Provider>,
    document.getElementById('root') as HTMLElement,
);
