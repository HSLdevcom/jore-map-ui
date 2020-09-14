import { ApolloQueryResult } from 'apollo-client';
import EndpointPath from '~/enums/endpointPath';
import RouteFactory from '~/factories/routeFactory';
import RoutePathFactory from '~/factories/routePathFactory';
import ApolloClient from '~/helpers/ApolloClient';
import { IRoute, IRoutePath } from '~/models';
import { IRoutePrimaryKey } from '~/models/IRoute';
import IExternalRoute from '~/models/externals/IExternalRoute';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath';
import HttpUtils from '~/utils/HttpUtils';
import GraphqlQueries from './graphqlQueries';

interface IAllRoutesQueryResult {
    lintunnus: string;
    reitunnus: string;
}

class RouteService {
    public static fetchRoute = async ({
        routeId,
        areRoutePathLinksExcluded,
    }: {
        routeId: string;
        areRoutePathLinksExcluded?: boolean;
    }): Promise<IRoute | null> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getRouteQuery(Boolean(areRoutePathLinksExcluded)),
            variables: { routeId },
        });
        const externalRoute: IExternalRoute = queryResult.data.route;
        if (!externalRoute) {
            return null;
        }
        const externalRoutePaths = externalRoute.reitinsuuntasByReitunnus.nodes;
        const routePaths: IRoutePath[] = externalRoutePaths.map(
            (externalRoutePath: IExternalRoutePath) => {
                const lineId = externalRoutePath.reittiByReitunnus.linjaByLintunnus.lintunnus;
                const transitType = externalRoutePath.reittiByReitunnus.linjaByLintunnus.linverkko;
                return RoutePathFactory.mapExternalRoutePath({
                    externalRoutePath,
                    lineId,
                    transitType,
                    externalRoutePathLinks: areRoutePathLinksExcluded
                        ? []
                        : externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.nodes,
                });
            }
        );
        routePaths.sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
        return RouteFactory.mapExternalRoute(queryResult.data.route, routePaths);
    };

    public static fetchAllRouteIds = async (): Promise<string[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllRoutesQuery(),
        });

        return queryResult.data.allReittis.nodes.map(
            (node: IAllRoutesQueryResult) => node.reitunnus
        );
    };

    public static updateRoute = async (route: IRoute) => {
        await HttpUtils.updateObject(EndpointPath.ROUTE, route);
    };

    public static createRoute = async (route: IRoute) => {
        const response = (await HttpUtils.createObject(
            EndpointPath.ROUTE,
            route
        )) as IRoutePrimaryKey;
        return response.id;
    };
}

export default RouteService;
