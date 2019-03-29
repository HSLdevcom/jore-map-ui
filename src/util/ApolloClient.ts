import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import * as Apollo from 'apollo-client';
import { BatchHttpLink } from 'apollo-link-batch-http';
import AuthService from '~/services/authService';
import DialogStore from '~/stores/dialogStore';
import httpStatusDescriptionCodeList from '~/codeLists/httpStatusDescriptionCodeList';

const API_URL = process.env.API_URL || 'http://localhost:3040';

const cache = new InMemoryCache();

class ApolloClient {
    private client: Apollo.ApolloClient<NormalizedCacheObject>;

    constructor () {
        this.client = new Apollo.ApolloClient({
            cache,
            link: new BatchHttpLink({
                uri: `${API_URL}/graphql`,
                // To keep the same express session information with each request
                credentials: 'include',
            }),
        });
    }

    public getClient() {
        return this.client;
    }

    public clearStore(): any {
        return this.client.clearStore();
    }

    public async query <T, TVariables = Apollo.OperationVariables > (
        options: Apollo.QueryOptions<TVariables>): Promise<Apollo.ApolloQueryResult<T>> {
        try {
            return await this.client.query<T>(options);
        } catch (e) {
            const err = e as Apollo.ApolloError;
            if (err.networkError) {
                switch (err.networkError['statusCode']) {
                case 403:
                    await DialogStore!.setFadeMessage(httpStatusDescriptionCodeList[403]);
                    AuthService.logout();
                }
            }
            throw e;
        }
    }
}

export default new ApolloClient();
