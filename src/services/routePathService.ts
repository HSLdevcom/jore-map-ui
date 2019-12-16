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

    public static updateRoutePath = async (routePath: IRoutePath) => {
        const requestBody = {
            routePath,
            viaNames: _getViaNames(routePath)
        };

        await ApiClient.updateObject(endpoints.ROUTEPATH, requestBody);
    };

    public static createRoutePath = async (routePath: IRoutePath) => {
        const requestBody = {
            routePath,
            viaNames: _getViaNames(routePath)
        };
        const response = (await ApiClient.createObject(
            endpoints.ROUTEPATH,
            requestBody
        )) as IRoutePathPrimaryKey;
        return response;
    };
}

const _getViaNames = (routePath: IRoutePath) => {
    const viaNames: IViaName[] = [];
    routePath.routePathLinks.forEach(rpLink => {
        if (rpLink.viaNameId) {
            const viaName: IViaName = {
                id: rpLink.viaNameId,
                destinationFi1: rpLink.destinationFi1,
                destinationFi2: rpLink.destinationFi2,
                destinationSw1: rpLink.destinationSw1,
                destinationSw2: rpLink.destinationSw2
            };
            viaNames.push(viaName);
        }
    });
    return viaNames;
};

export default RoutePathService;
