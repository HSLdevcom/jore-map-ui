import { ApolloQueryResult } from 'apollo-client';
import endpoints from '~/enums/endpoints';
import LineFactory from '~/factories/lineFactory';
import { ILine } from '~/models';
import { ILinePrimaryKey } from '~/models/ILine';
import ISearchLine from '~/models/searchModels/ISearchLine';
import ApiClient from '~/util/ApiClient';
import ApolloClient from '~/util/ApolloClient';
import GraphqlQueries from './graphqlQueries';

class LineService {
    public static fetchLine = async (lintunnus: string): Promise<ILine> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getLineQuery(),
            variables: { lineId: lintunnus }
        });

        return LineFactory.createLine(queryResult.data.linjaByLintunnus);
    };

    public static fetchAllSearchLines = async (): Promise<ISearchLine[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllSearchLinesQuery()
        });

        return queryResult.data.allLinjas.nodes.map((linja: any) => {
            return LineFactory.createSearchLine(linja);
        });
    };

    public static fetchSearchLine = async (lintunnus: string): Promise<ISearchLine> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getSearchLineQuery(),
            variables: { lineId: lintunnus }
        });

        return LineFactory.createSearchLine(queryResult.data.linjaByLintunnus);
    };

    public static updateLine = async (line: ILine) => {
        await ApiClient.updateObject(endpoints.LINE, line);
    };

    public static createLine = async (Line: ILine) => {
        const response = (await ApiClient.createObject(endpoints.LINE, Line)) as ILinePrimaryKey;
        return response.id;
    };
}

export default LineService;
