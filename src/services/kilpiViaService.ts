import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import { IKilpiVia } from '~/models/IKilpiVia';
import GraphqlQueries from './graphqlQueries';

class KilpiViaService {
    public static fetchKilpiViaName = async (
        id: string
    ): Promise<IKilpiVia | null> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getViaKilpiName(),
            variables: {
                relid: id
            }
        });

        return queryResult.data.kilpiVia
            ? {
                  relid: queryResult.data.kilpiVia.relid,
                  nameFi: queryResult.data.kilpiVia.viasuomi,
                  nameSw: queryResult.data.kilpiVia.viaruotsi
              }
            : null;
    };
}

export default KilpiViaService;
