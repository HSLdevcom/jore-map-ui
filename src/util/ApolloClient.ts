import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import * as Apollo from 'apollo-client';
import { BatchHttpLink } from 'apollo-link-batch-http';
import constants from '~/constants/constants';
import LoginStore from '~/stores/loginStore';
import AlertStore from '~/stores/alertStore';
import httpStatusDescriptionCodeList from '~/codeLists/httpStatusDescriptionCodeList';

const cache = new InMemoryCache();

class ApolloClient {
    private client: Apollo.ApolloClient<NormalizedCacheObject>;

    constructor() {
        this.client = new Apollo.ApolloClient({
            cache,
            link: new BatchHttpLink({
                uri: `${constants.API_URL}/graphql`,
                // To keep the same express session information with each request
                credentials: 'include'
            })
        });
    }

    public getClient() {
        return this.client;
    }

    public clearStore = async () => {
        // Remove all data from the store.
        await this.client.clearStore();
    };

    public async query<T, TVariables = Apollo.OperationVariables>(
        options: Apollo.QueryOptions<TVariables>
    ): Promise<Apollo.ApolloQueryResult<T>> {
        try {
            return await this.client.query<T>(options);
        } catch (e) {
            const err = e as Apollo.ApolloError;
            if (err.networkError) {
                switch (err.networkError['statusCode']) {
                    case 403:
                        AlertStore!
                            .setFadeMessage(httpStatusDescriptionCodeList[403])
                            .then(() => {
                                LoginStore.clear();
                            });
                }
            }
            throw e;
        }
    }
}

export default new ApolloClient();
