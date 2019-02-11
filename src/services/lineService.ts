import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import LineFactory from '~/factories/lineFactory';
import { ILine } from '~/models';
import GraphqlQueries from './graphqlQueries';

class LineService {
    public static fetchAllLines = async (): Promise<ILine[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query: GraphqlQueries.getAllLinesQuery() },
        );

        return queryResult.data.allLinjas.nodes.map(((linja: any) => {
            return LineFactory.createLine(linja);
        }));
    }

    public static fetchLine = async (lintunnus: string): Promise<ILine> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query: GraphqlQueries.getLineQuery(), variables: { lineId: lintunnus } },
        );

        return LineFactory.createLine(queryResult.data.linjaByLintunnus);
    }
}

export default LineService;
