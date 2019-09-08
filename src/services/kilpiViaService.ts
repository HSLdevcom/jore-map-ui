import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import { IKilpiViaPrimaryKey, IKilpiVia } from '~/models/IKilpiVia';
import ApiClient from '~/util/ApiClient';
import endpoints from '~/enums/endpoints';
import GraphqlQueries from './graphqlQueries';


class KilpiViaService {

    public static fetchKilpiViaName = async (id: string): Promise<IKilpiVia | null> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getViaKilpiName(),
            variables: {
                relid: id
            }
        });
        return queryResult.data.kilpiVia ? queryResult.data.kilpiVia : null;
    };

    public static updateKilpiViaNames = async (kilpiViaNames: IKilpiVia[]) => {
        await ApiClient.updateObject(endpoints.KILPI_VIA, kilpiViaNames);
        await apolloClient.clearStore();
    };

    public static createKilpiViaNames = async (kilpiViaNames: IKilpiVia[]) => {
        const response = (await ApiClient.createObject(
            endpoints.KILPI_VIA,
            kilpiViaNames
        )) as IKilpiViaPrimaryKey;
        await apolloClient.clearStore();
        return response;
    };

};


export default KilpiViaService;
