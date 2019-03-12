import { ApolloQueryResult } from 'apollo-client';
import moment from 'moment';
import apolloClient from '~/util/ApolloClient';
import { IRoutePath } from '~/models';
import ApiClient from '~/util/ApiClient';
import endpoints from '~/enums/endpoints';
import RoutePathFactory from '../factories/routePathFactory';
import GraphqlQueries from './graphqlQueries';

class RoutePathService {
    public static fetchRoutePath =
        async (routeId: string, startDate: moment.Moment, direction: string):
            Promise<IRoutePath> => {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                {
                    query: GraphqlQueries.getRoutePathQuery(),
                    variables: {
                        routeId,
                        direction,
                        startDate: startDate.format(),
                    } },
            );
            return RoutePathFactory.createRoutePath(routeId, queryResult.data.routePath);
        }

    public static updateRoutePath = async (routePath: IRoutePath) => {
        await ApiClient.updateObject(endpoints.ROUTEPATH, routePath);
        await apolloClient.clearStore();
    }

    public static createRoutePath = async (routePath: IRoutePath) => {
        await ApiClient.createObject(endpoints.ROUTEPATH, routePath);
        await apolloClient.clearStore();
    }
}

export default RoutePathService;
