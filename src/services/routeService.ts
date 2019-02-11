import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import RouteFactory from '~/factories/routeFactory';
import { IRoute, INode } from '~/models';
import LineService from './lineService';
import GraphqlQueries from './graphqlQueries';

export interface IMultipleRoutesQueryResult {
    routes: IRoute[];
    nodes: INode[];
}

class RouteService {
    public static fetchRoute = async (routeId: string): Promise<IRoute> => {
        return await RouteService.runFetchRouteQuery(routeId);
    }

    public static fetchMultipleRoutes = async (routeIds: string[]): Promise<IRoute[]> => {
        const routes = await Promise
            .all(routeIds.map(id => RouteService.runFetchRouteQuery(id)));

        return routes.map((res: IRoute) => res!);
    }

    private static runFetchRouteQuery = async (routeId: string): Promise<IRoute> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query: GraphqlQueries.getRouteQuery(), variables: { routeId } },
        );
        const line = await LineService.fetchLine(queryResult.data.route.lintunnus);
        return RouteFactory.createRoute(queryResult.data.route, line);
    }
}

export default RouteService;
