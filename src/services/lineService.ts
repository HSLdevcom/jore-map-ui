import { ApolloQueryResult } from 'apollo-client';
import _ from 'lodash';
import EndpointPath from '~/enums/endpointPath';
import LineFactory from '~/factories/lineFactory';
import RouteFactory from '~/factories/routeFactory';
import ApolloClient from '~/helpers/ApolloClient';
import { ILine, IRoute } from '~/models';
import { ILinePrimaryKey, ISearchLine } from '~/models/ILine';
import IExternalRoute from '~/models/externals/IExternalRoute';
import HttpUtils from '~/utils/HttpUtils';
import GraphqlQueries from './graphqlQueries';

class LineService {
    public static fetchLine = async (lineId: string): Promise<ILine> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getLineQuery(),
            variables: { lineId },
        });
        if (!queryResult.data.linjaByLintunnus) {
            throw `Linjaa ${lineId} ei löytynyt.`;
        }
        return LineFactory.mapExternalLine(queryResult.data.linjaByLintunnus);
    };

    public static fetchMultipleLines = async (lineIds: string[]): Promise<ILine[]> => {
        const lines: ILine[] = [];
        const promises: Promise<void>[] = lineIds.map((lineId: string) => {
            const createPromise = async () => {
                const line = await LineService.fetchLine(lineId);
                lines.push(line);
            };
            return createPromise();
        });

        await Promise.all(promises);
        return lines;
    };

    public static fetchLineAndRoutes = async (
        lintunnus: string
    ): Promise<{
        line: ILine;
        routes: IRoute[];
    } | null> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getLineAndRoutesQuery(),
            variables: { lineId: lintunnus },
        });
        const externalLine = queryResult.data.linjaByLintunnus;
        if (!externalLine) return null;
        const externalRoutes = externalLine.reittisByLintunnus.nodes;
        return {
            line: LineFactory.mapExternalLine(externalLine),
            routes: externalRoutes.map((externalRoute: IExternalRoute) =>
                RouteFactory.mapExternalRoute(externalRoute)
            ),
        };
    };

    public static fetchAllSearchLines = async (): Promise<ISearchLine[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllSearchLinesQuery(),
        });

        return queryResult.data.allLinjas.nodes.map((linja: any) => {
            return LineFactory.createSearchLine(linja);
        });
    };

    public static updateLine = async (line: ILine) => {
        const lineSaveModel = _.cloneDeep(line);
        if (!lineSaveModel.exchangeTime) {
            lineSaveModel.exchangeTime = 0;
        }
        await HttpUtils.updateObject(EndpointPath.LINE, lineSaveModel);
    };

    public static createLine = async (line: ILine) => {
        const lineSaveModel = _.cloneDeep(line);
        if (!lineSaveModel.exchangeTime) {
            lineSaveModel.exchangeTime = 0;
        }
        const response = (await HttpUtils.createObject(
            EndpointPath.LINE,
            lineSaveModel
        )) as ILinePrimaryKey;
        return response.id;
    };
}

export default LineService;
