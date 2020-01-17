import { ApolloQueryResult } from 'apollo-client';
import EndpointPath from '~/enums/endpointPath';
import RouteFactory from '~/factories/routeFactory';
import { IRoute } from '~/models';
import { IRoutePrimaryKey } from '~/models/IRoute';
import ApiClient from '~/util/ApiClient';
import ApolloClient from '~/util/ApolloClient';
import GraphqlQueries from './graphqlQueries';
import LineService from './lineService';

interface IAllRoutesQueryResult {
    lintunnus: string;
    reitunnus: string;
}

class RouteService {
    public static fetchRoute = async (routeId: string): Promise<IRoute> => {
        return await RouteService.runFetchRouteQuery(routeId);
    };

    public static fetchAllRoutesByLineId = async (lineId: string): Promise<IRoute[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllRoutesQuery()
        });
        const routeIdsByLineId = queryResult.data.allReittis.nodes
            .filter((node: IAllRoutesQueryResult) => {
                return node.lintunnus === lineId;
            })
            .map((node: IAllRoutesQueryResult) => {
                return node.reitunnus;
            });
        const promises: Promise<void>[] = [];
        const routes: IRoute[] = [];
        routeIdsByLineId.forEach((routeId: string) => {
            const promise = async () => {
                const route: IRoute = await RouteService.runFetchRouteQuery(routeId);
                routes.push(route);
            };
            promises.push(promise());
        });
        await Promise.all(promises);

        return routes;
    };

    public static fetchMultipleRoutes = async (routeIds: string[]): Promise<IRoute[]> => {
        const promises: Promise<void>[] = [];
        const routes: IRoute[] = [];
        routeIds.map((routeId: string) => {
            const createPromise = async () => {
                const route = await RouteService.runFetchRouteQuery(routeId, {
                    areRoutePathLinksExcluded: true
                });
                routes.push(route);
            };
            promises.push(createPromise());
        });

        await Promise.all(promises);
        return routes.map((res: IRoute) => res!);
    };

    public static fetchAllRouteIds = async (): Promise<string[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllRoutesQuery()
        });

        return queryResult.data.allReittis.nodes.map(
            (node: IAllRoutesQueryResult) => node.reitunnus
        );
    };

    private static runFetchRouteQuery = async (
        routeId: string,
        { areRoutePathLinksExcluded }: { areRoutePathLinksExcluded?: boolean } = {}
    ): Promise<IRoute> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getRouteQuery(Boolean(areRoutePathLinksExcluded)),
            variables: { routeId }
        });
        const line = await LineService.fetchLine(queryResult.data.route.lintunnus);
        return RouteFactory.mapExternalRoute(queryResult.data.route, line);
    };

    public static updateRoute = async (route: IRoute) => {
        await ApiClient.updateObject(EndpointPath.ROUTE, route);
    };

    public static createRoute = async (route: IRoute) => {
        const response = (await ApiClient.createObject(
            EndpointPath.ROUTE,
            route
        )) as IRoutePrimaryKey;
        return response.id;
    };
}

export default RouteService;
