import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/helpers/ApolloClient';
import { IViaName } from '~/models';
import IViaShieldName from '~/models/IViaShieldName';
import GraphqlQueries from './graphqlQueries';

class ViaNameService {
    public static fetchViaName = async (id: string): Promise<IViaName | null> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getViaNameQuery(),
            variables: {
                relid: id
            }
        });

        const viaName = queryResult.data.viaName;
        return viaName
            ? {
                  viaNameId: `${viaName.relid}`,
                  destinationFi1: viaName.maaranpaa1,
                  destinationFi2: viaName.maaranpaa2,
                  destinationSw1: viaName.maaranpaa1R,
                  destinationSw2: viaName.maaranpaa2R
              }
            : null;
    };

    public static fetchViaShieldName = async (id: string): Promise<IViaShieldName | null> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getViaShieldNameQuery(),
            variables: {
                relid: id
            }
        });
        const viaShieldName = queryResult.data.viaShieldName;
        return viaShieldName
            ? {
                  viaShieldNameId: `${viaShieldName.relid}`,
                  destinationShieldFi: viaShieldName.viasuomi,
                  destinationShieldSw: viaShieldName.viaruotsi
              }
            : null;
    };
}

export default ViaNameService;
