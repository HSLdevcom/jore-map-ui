import { ApolloQueryResult } from 'apollo-client';
import Moment from 'moment';
import apolloClient from '~/util/ApolloClient';
import { IRoutePath } from '~/models';
import ApiClient from '~/util/ApiClient';
import endpoints from '~/enums/endpoints';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath';
import { IRoutePathPrimaryKey } from '~/models/IRoutePath';
import RoutePathFactory from '../factories/routePathFactory';
import GraphqlQueries from './graphqlQueries';

class RoutePathService {
    public static fetchRoutePath = async (
        routeId: string,
        startDate: Moment.Moment,
        direction: string
    ): Promise<IRoutePath> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getRoutePathQuery(),
            variables: {
                routeId,
                direction,
                startDate: startDate.format()
            }
        });
        return RoutePathFactory.mapExternalRoutePath(
            queryResult.data.routePath
        );
    };

    public static fetchRoutePathsUsingLinkFromDate = async (
        startNodeId: string,
        endNodeId: string,
        transitType: string,
        date: Date
    ): Promise<IRoutePath[]> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query({
            query: GraphqlQueries.getRoutePathsUsingLinkFromDate(),
            variables: {
                startNodeId,
                endNodeId,
                transitType,
                date
            }
        });
        return queryResult.data.routePaths.nodes.map(
            (externalRp: IExternalRoutePath) =>
                RoutePathFactory.mapExternalRoutePath(externalRp)
        );
    };

    public static updateRoutePath = async (routePath: IRoutePath) => {
        await ApiClient.updateObject(endpoints.ROUTEPATH, routePath);
        await apolloClient.clearStore();
    };

    public static createRoutePath = async (routePath: IRoutePath) => {
        const response = (await ApiClient.createObject(
            endpoints.ROUTEPATH,
            routePath
        )) as IRoutePathPrimaryKey;
        await apolloClient.clearStore();
        return response;
    };
}

export default RoutePathService;
