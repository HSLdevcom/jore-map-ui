import { ApolloQueryResult } from 'apollo-client';
import EndpointPath from '~/enums/endpointPath';
import RouteFactory from '~/factories/routeFactory';
import { IRoute } from '~/models';
import { IRoutePrimaryKey } from '~/models/IRoute';
import ApiClient from '~/util/ApiClient';
import ApolloClient from '~/util/ApolloClient';
import GraphqlQueries from './graphqlQueries';

interface IAllRoutesQueryResult {
    lintunnus: string;
    reitunnus: string;
}

class RouteService {
    public static fetchRoute = async (
        routeId: string,
        { areRoutePathLinksExcluded }: { areRoutePathLinksExcluded?: boolean } = {}
    ): Promise<IRoute> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getRouteQuery(Boolean(areRoutePathLinksExcluded)),
            variables: { routeId }
        });
        return RouteFactory.mapExternalRoute(queryResult.data.route);
    };

    public static fetchMultipleRoutes = async (routeIds: string[]): Promise<IRoute[]> => {
        const promises: Promise<void>[] = [];
        const routes: IRoute[] = [];
        routeIds.map((routeId: string) => {
            const createPromise = async () => {
                const route = await RouteService.fetchRoute(routeId, {
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
