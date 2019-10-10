import { ApolloQueryResult } from 'apollo-client';
import Moment from 'moment';
import endpoints from '~/enums/endpoints';
import { IRoutePath, IViaName } from '~/models';
import { IRoutePathPrimaryKey } from '~/models/IRoutePath';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath';
import ApiClient from '~/util/ApiClient';
import ApolloClient from '~/util/ApolloClient';
import RoutePathFactory from '../factories/routePathFactory';
import GraphqlQueries from './graphqlQueries';

class RoutePathService {
    public static fetchRoutePath = async (
        routeId: string,
        startTime: Date,
        direction: string
    ): Promise<IRoutePath> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getRoutePathQuery(),
            variables: {
                routeId,
                direction,
                startDate: Moment(startTime).format()
            }
        });

        return RoutePathFactory.mapExternalRoutePath(queryResult.data.routePath);
    };

    public static fetchAllRoutePathPrimaryKeys = async (
        routeId: string
    ): Promise<IRoutePathPrimaryKey[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllRoutePathPrimaryKeysQuery(),
            variables: {
                routeId
            }
        });
        return queryResult.data.routePathPrimaryKeys.nodes.map((rp: IExternalRoutePath) =>
            RoutePathFactory.mapExternalRoutePathToRoutePathPrimaryKey(rp)
        );
    };

    public static fetchRoutePathsUsingLinkFromDate = async (
        startNodeId: string,
        endNodeId: string,
        transitType: string,
        date: Date
    ): Promise<IRoutePath[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getRoutePathsUsingLinkFromDate(),
            variables: {
                startNodeId,
                endNodeId,
                transitType,
                date
            }
        });
        return queryResult.data.routePaths.nodes.map((externalRp: IExternalRoutePath) =>
            RoutePathFactory.mapExternalRoutePath(externalRp)
        );
    };

    public static updateRoutePath = async (routePath: IRoutePath, viaNames: IViaName[]) => {
        const requestBody = {
            routePath,
            viaNames
        };

        await ApiClient.updateObject(endpoints.ROUTEPATH, requestBody);
    };

    public static createRoutePath = async (routePath: IRoutePath, viaNames: IViaName[]) => {
        const requestBody = {
            routePath,
            viaNames
        };
        const response = (await ApiClient.createObject(
            endpoints.ROUTEPATH,
            requestBody
        )) as IRoutePathPrimaryKey;
        return response;
    };
}

export default RoutePathService;
