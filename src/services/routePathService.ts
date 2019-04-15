import { ApolloQueryResult } from 'apollo-client';
import Moment from 'moment';
import apolloClient from '~/util/ApolloClient';
import { IRoutePath } from '~/models';
import ApiClient from '~/util/ApiClient';
import endpoints from '~/enums/endpoints';
import { IRoutePathPrimaryKey } from '~/models/IRoutePath';
import RoutePathFactory from '../factories/routePathFactory';
import GraphqlQueries from './graphqlQueries';

class RoutePathService {
    public static fetchRoutePath =
        async (routeId: string, startDate: Moment.Moment, direction: string):
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
            return RoutePathFactory.mapExternalRoutePath(queryResult.data.routePath);
        }

    public static updateRoutePath = async (routePath: IRoutePath) => {
        await ApiClient.updateObject(endpoints.ROUTEPATH, routePath);
        await apolloClient.clearStore();
    }

    public static createRoutePath = async (routePath: IRoutePath) => {
        const response =
            await ApiClient.createObject(endpoints.ROUTEPATH, routePath) as IRoutePathPrimaryKey;
        await apolloClient.clearStore();
        return response;
    }
}

export default RoutePathService;
