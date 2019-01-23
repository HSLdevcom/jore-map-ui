import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import RouteFactory from '~/factories/routeFactory';
import { IRoute, INode } from '~/models';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import LineService from './lineService';
import GraphqlQueries from './graphqlQueries';

export interface IMultipleRoutesQueryResult {
    routes: IRoute[];
    nodes: INode[];
}

class RouteService {
    public static fetchRoute = async (routeId: string): Promise<IRoute | null> => {
        const route = await RouteService.runFetchRouteQuery(routeId);
        return route ? route : null;
    }

    public static fetchMultipleRoutes = async (routeIds: string[]): Promise<IRoute[] | null> => {
        const routes = await Promise
            .all(routeIds.map(id => RouteService.runFetchRouteQuery(id)));

        if (!routes) return null;

        return routes.map((res: IRoute) => res!);
    }

    private static runFetchRouteQuery = async (routeId: string): Promise<IRoute | null> => {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: GraphqlQueries.getRouteQuery(), variables: { routeId } },
            );
            const line = await LineService.fetchLine(queryResult.data.route.lintunnus);
            if (line !== null) {
                return RouteFactory.createRoute(queryResult.data.route, line);
            }
            return null;
        } catch (error) {
            console.error(error); // tslint:disable-line
            notificationStore.addNotification({
                message: 'Reitin haku ei onnistunut.',
                type: NotificationType.ERROR,
            });
            return null;
        }
    }
}

export default RouteService;
