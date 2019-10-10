import { ApolloQueryResult } from 'apollo-client';
import ApolloClient from '~/util/ApolloClient';
import ApiClient from '~/util/ApiClient';
import LineFactory from '~/factories/lineFactory';
import { ILine } from '~/models';
import ISearchLine from '~/models/searchModels/ISearchLine';
import { ILinePrimaryKey } from '~/models/ILine';
import endpoints from '~/enums/endpoints';
import GraphqlQueries from './graphqlQueries';

class LineService {
    public static fetchLine = async (lintunnus: string): Promise<ILine> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getLineQuery(),
            variables: { lineId: lintunnus }
        });

        // TODO: routes fetch
        // const externalLine = queryResult.data.linjaByLintunnus;
        // const routes =
        // await RouteService.fetchRouteByLineId(externalLine.lintunnus);
        // LineFactory.createLine(externalLine, routes);

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
