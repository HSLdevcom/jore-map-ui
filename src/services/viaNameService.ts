import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import { IViaName } from '~/models/IViaName';
import GraphqlQueries from './graphqlQueries';

class ViaNameService {
    public static fetchViaName = async (id: string): Promise<IViaName | null> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getViaName(),
            variables: {
                relid: id
            }
        });

        return queryResult.data.viaName
            ? {
                  id: `${queryResult.data.viaName.relid}`,
                  destinationFi1: queryResult.data.viaName.maaranpaa1,
                  destinationFi2: queryResult.data.viaName.maaranpaa2,
                  destinationSw1: queryResult.data.viaName.maaranpaa1R,
                  destinationSw2: queryResult.data.viaName.maaranpaa2R
              }
            : null;
    };
}

export default ViaNameService;
