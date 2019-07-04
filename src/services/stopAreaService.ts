import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import GraphqlQueries from './graphqlQueries';

interface IStopAreaItem {
    pysalueid: string;
    nimi: string;
}

class StopAreaService {
    public static fetchAllStopAreas = async (): Promise<IStopAreaItem[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getAllStopAreas()
        });

        return queryResult.data.node.nodes;
    };
}

export default StopAreaService;

export { IStopAreaItem };
