import { ApolloQueryResult } from 'apollo-client';
import CodeListFactory from '~/factories/codeListFactory';
import ApolloClient from '~/helpers/ApolloClient';
import ICodeListItem from '~/models/ICodeListItem';
import GraphqlQueries from './graphqlQueries';

class CodeListService {
    public static fetchAllCodeLists = async (): Promise<ICodeListItem[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllCodeLists(),
            // TODO: add variables filter containing all of the needed codeListNames (to possibly speed up the query)
        });

        return queryResult.data.node.nodes.map((koodisto: any) => {
            return CodeListFactory.createCodeListItem(koodisto);
        });
    };
}

export default CodeListService;
