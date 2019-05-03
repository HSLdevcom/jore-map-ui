import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import RouteFactory from '~/factories/routeFactory';
import { IRoute, INode } from '~/models';
import { IRoutePrimaryKey } from '~/models/IRoute';
import ApiClient from '~/util/ApiClient';
import endpoints from '~/enums/endpoints';
import LineService from './lineService';
import GraphqlQueries from './graphqlQueries';

export interface IMultipleRoutesQueryResult {
    routes: IRoute[];
    nodes: INode[];
}

class RouteService {
    public static fetchRoute = async (routeId: string): Promise<IRoute> => {
        return await RouteService.runFetchRouteQuery(routeId);
    };

    public static fetchMultipleRoutes = async (
        routeIds: string[]
    ): Promise<IRoute[]> => {
        const routes = await Promise.all(
            routeIds.map(id => RouteService.runFetchRouteQuery(id))
        );

        return routes.map((res: IRoute) => res!);
    };

    public static fetchAllRouteIds = async (): Promise<string[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getAllRoutesQuery()
        });

        return queryResult.data.allReittis.nodes.map(
            (node: any) => node.reitunnus
        );
    };

    private static runFetchRouteQuery = async (
        routeId: string
    ): Promise<IRoute> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getRouteQuery(),
            variables: { routeId }
        });
        const line = await LineService.fetchLine(
            queryResult.data.route.lintunnus
        );
        return RouteFactory.mapExternalRoute(queryResult.data.route, line);
    };

    public static updateRoute = async (route: IRoute) => {
        await ApiClient.updateObject(endpoints.ROUTE, route);
        await apolloClient.clearStore();
    };

    public static createRoute = async (route: IRoute) => {
        const response = (await ApiClient.createObject(
            endpoints.ROUTE,
            route
        )) as IRoutePrimaryKey;
        await apolloClient.clearStore();
        return response.id;
    };
}

export default RouteService;
