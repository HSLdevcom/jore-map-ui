import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { BatchHttpLink } from 'apollo-link-batch-http';

const API_URL = process.env.API_URL || 'http://localhost:3040';

const cache = new InMemoryCache();

const client = new ApolloClient({
    cache,
    link: new BatchHttpLink({ uri: `${API_URL}/graphql` }),
});

export default client;
