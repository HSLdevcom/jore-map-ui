import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import ApiClient from '~/util/ApiClient';
import LineFactory from '~/factories/lineFactory';
import { ILine, IRoute } from '~/models';
import ISearchLine from '~/models/searchModels/ISearchLine';
import { ILinePrimaryKey } from '~/models/ILine';
import endpoints from '~/enums/endpoints';
import GraphqlQueries from './graphqlQueries';

interface ILineSavingModel {
    line: ILine;
    routes: IRoute[];
}

class LineService {
    public static fetchLine = async (lintunnus: string): Promise<ILine> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query: GraphqlQueries.getLineQuery(), variables: { lineId: lintunnus } },
        );

        // TODO: routes fetch
        // const externalLine = queryResult.data.linjaByLintunnus;
        // const routes =
        // await RouteService.fetchRouteByLineId(externalLine.lintunnus);
        // LineFactory.createLine(externalLine, routes);

        return LineFactory.createLine(queryResult.data.linjaByLintunnus);
    }

    public static fetchAllSearchLines = async (): Promise<ISearchLine[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query: GraphqlQueries.getAllSearchLinesQuery() },
        );

        return queryResult.data.allLinjas.nodes.map(((linja: any) => {
            return LineFactory.createSearchLine(linja);
        }));
    }

    public static fetchSearchLine = async (lintunnus: string): Promise<ISearchLine> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query: GraphqlQueries.getSearchLineQuery(), variables: { lineId: lintunnus } },
        );

        return LineFactory.createSearchLine(queryResult.data.linjaByLintunnus);
    }

    public static updateLine = async (line: ILine) => {
        const requestBody: ILineSavingModel = {
            line,
            routes: line.routes,
        };

        await ApiClient.updateObject(endpoints.LINE, requestBody);
        await apolloClient.clearStore();
    }

    public static createLine = async (Line: ILine) => {
        const response =
            await ApiClient.createObject(endpoints.LINE, Line) as ILinePrimaryKey;
        await apolloClient.clearStore();
        return response.id;
    }
}

export default LineService;
