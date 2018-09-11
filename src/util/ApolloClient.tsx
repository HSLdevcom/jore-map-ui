import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { BatchHttpLink } from 'apollo-link-batch-http';

const cache = new InMemoryCache();

const client = new ApolloClient({
    cache,
    link: new BatchHttpLink({ uri: 'http://localhost:3040/graphql' }),
});

export default client;
