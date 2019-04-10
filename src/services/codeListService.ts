import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import CodeListFactory from '~/factories/codeListFactory';
import ICodeListItem from '~/models/ICodeListItem';
import GraphqlQueries from './graphqlQueries';

class CodeListService {
    public static fetchAllCodeLists = async (): Promise<ICodeListItem[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query: GraphqlQueries.getAllCodeLists() },
        );

        return queryResult.data.node.nodes.map(((koodisto: any) => {
            return CodeListFactory.createCodeListItem(koodisto);
        }));
    }
}

export default CodeListService;
