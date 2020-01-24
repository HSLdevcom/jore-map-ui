import { ApolloQueryResult } from 'apollo-client';
import EndpointPath from '~/enums/endpointPath';
import LineFactory from '~/factories/lineFactory';
import RouteFactory from '~/factories/routeFactory';
import { ILine, IRoute } from '~/models';
import { ILinePrimaryKey } from '~/models/ILine';
import IExternalRoute from '~/models/externals/IExternalRoute';
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
        return LineFactory.mapExternalLine(queryResult.data.linjaByLintunnus);
    };

    public static fetchMultipleLines = async (lineIds: string[]): Promise<ILine[]> => {
        const promises: Promise<void>[] = [];
        const lines: ILine[] = [];
        lineIds.map((lineId: string) => {
            const createPromise = async () => {
                const route = await LineService.fetchLine(lineId);
                lines.push(route);
            };
            promises.push(createPromise());
        });

        await Promise.all(promises);
        return lines;
    };

    public static fetchLineAndRoutes = async (
        lintunnus: string
    ): Promise<{
        line: ILine;
        routes: IRoute[];
    }> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getLineAndRoutesQuery(),
            variables: { lineId: lintunnus }
        });
        const externalLine = queryResult.data.linjaByLintunnus;
        const externalRoutes = externalLine.reittisByLintunnus.nodes;
        return {
            line: LineFactory.mapExternalLine(externalLine),
            routes: externalRoutes.map((externalRoute: IExternalRoute) =>
                RouteFactory.mapExternalRoute(externalRoute)
            )
        };
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
        await ApiClient.updateObject(EndpointPath.LINE, line);
    };

    public static createLine = async (Line: ILine) => {
        const response = (await ApiClient.createObject(EndpointPath.LINE, Line)) as ILinePrimaryKey;
        return response.id;
    };
}

export default LineService;
