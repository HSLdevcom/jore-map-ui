import { ApolloQueryResult } from 'apollo-client';
import Moment from 'moment';
import EndpointPath from '~/enums/endpointPath';
import NodeType from '~/enums/nodeType';
import ApolloClient from '~/helpers/ApolloClientHelper';
import { IRoutePath, IViaName } from '~/models';
import { IRoutePathPrimaryKey } from '~/models/IRoutePath';
import IExternalNode from '~/models/externals/IExternalNode';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import HttpUtils from '~/utils/HttpUtils';
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
            },
            fetchPolicy: 'no-cache'
        });

        return RoutePathFactory.mapExternalRoutePath(queryResult.data.routePath);
    };

    public static fetchFirstAndLastStopNamesOfRoutePath = async (
        routePathPrimaryKey: IRoutePathPrimaryKey
    ): Promise<Object> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getFirstAndLastStopNamesOfRoutePath(),
            variables: {
                routeId: routePathPrimaryKey.routeId,
                direction: routePathPrimaryKey.direction,
                startDate: Moment(routePathPrimaryKey.startTime).format()
            },
            fetchPolicy: 'no-cache'
        });
        const nodes: IExternalRoutePathLink[] =
            queryResult.data.routePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.nodes;
        nodes.sort((a: IExternalRoutePathLink, b: IExternalRoutePathLink) => a.reljarjnro < b.reljarjnro ? -1 : 1);
        const stopNames = {
            firstStopName: _getFirstStopName(nodes),
            lastStopName: _getLastStopName(nodes)
        }
        return stopNames;
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

        await HttpUtils.updateObject(EndpointPath.ROUTEPATH, requestBody);
    };

    public static createRoutePath = async (routePath: IRoutePath) => {
        const requestBody = {
            routePath,
            viaNames: _getViaNames(routePath)
        };
        const response = (await HttpUtils.createObject(
            EndpointPath.ROUTEPATH,
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

const _getFirstStopName = (nodes: IExternalRoutePathLink[]) => {
    for (let i = 0; i < nodes.length; i += 1) {
        const stopName = _getValidStopName(nodes[i].solmuByLnkalkusolmu);
        if (stopName) {
            return stopName;
        }
    }
    return '';
}

const _getLastStopName = (nodes: IExternalRoutePathLink[]) => {
    for (let i = nodes.length - 1; i > 0; i -= 1) {
        const stopName = _getValidStopName(nodes[i].solmuByLnkloppusolmu);
        if (stopName) {
            return stopName;
        }
    }
    return '';
}

const _getValidStopName = (node: IExternalNode): string | null => {
    if (node.soltyyppi === NodeType.STOP && node.pysakkiBySoltunnus?.pysnimi) {
        return node.pysakkiBySoltunnus.pysnimi;
    }
    return null;
}

export default RoutePathService;
