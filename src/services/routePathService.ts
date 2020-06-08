import { ApolloQueryResult } from 'apollo-client';
import _ from 'lodash';
import Moment from 'moment';
import EndpointPath from '~/enums/endpointPath';
import NodeType from '~/enums/nodeType';
import ApolloClient from '~/helpers/ApolloClient';
import { IRoutePath } from '~/models';
import { IRoutePathPrimaryKey, IRoutePathSaveModel } from '~/models/IRoutePath';
import IRoutePathLink, { IRoutePathLinkSaveModel } from '~/models/IRoutePathLink';
import IExternalNode from '~/models/externals/IExternalNode';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import HttpUtils from '~/utils/HttpUtils';
import RoutePathFactory from '../factories/routePathFactory';
import GraphqlQueries from './graphqlQueries';

class RoutePathService {
    public static fetchRoutePath = async (
        routeId: string,
        startDate: Date,
        direction: string
    ): Promise<IRoutePath | null> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getRoutePathQuery(),
            variables: {
                routeId,
                direction,
                startDate: Moment(startDate).format(),
            },
        });
        const externalRoutePath: IExternalRoutePath | null = queryResult.data.routePath;
        if (!externalRoutePath) return null;
        const lineId = externalRoutePath.reittiByReitunnus.linjaByLintunnus.lintunnus;
        const transitType = externalRoutePath.reittiByReitunnus.linjaByLintunnus.linverkko;
        return RoutePathFactory.mapExternalRoutePath(externalRoutePath, lineId, transitType);
    };

    public static fetchFirstAndLastStopNamesOfRoutePath = async (
        routePathPrimaryKey: IRoutePathPrimaryKey
    ): Promise<Object> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getFirstAndLastStopNamesOfRoutePath(),
            variables: {
                routeId: routePathPrimaryKey.routeId,
                direction: routePathPrimaryKey.direction,
                startDate: Moment(routePathPrimaryKey.startDate).format(),
            },
        });
        const nodes: IExternalRoutePathLink[] =
            queryResult.data.routePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.nodes;
        nodes.sort((a: IExternalRoutePathLink, b: IExternalRoutePathLink) =>
            a.reljarjnro < b.reljarjnro ? -1 : 1
        );
        const stopNames = {
            firstStopName: _getFirstStopName(nodes),
            lastStopName: _getLastStopName(nodes),
        };
        return stopNames;
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
                date,
            },
        });
        return queryResult.data.routePaths.nodes.map((externalRoutePath: IExternalRoutePath) => {
            const lineId = externalRoutePath.reittiByReitunnus.linjaByLintunnus.lintunnus;
            const transitType = externalRoutePath.reittiByReitunnus.linjaByLintunnus.linverkko;
            return RoutePathFactory.mapExternalRoutePath(externalRoutePath, lineId, transitType);
        });
    };

    public static updateRoutePath = async (newRoutePath: IRoutePath, oldRoutePath: IRoutePath) => {
        const routePathSaveModel = _createRoutePathSaveModel(
            _.cloneDeep(newRoutePath),
            _.cloneDeep(oldRoutePath)
        );
        await HttpUtils.updateObject(EndpointPath.ROUTE_PATH, routePathSaveModel);
    };

    public static createRoutePath = async (newRoutePath: IRoutePath) => {
        const routePathSaveModel = _createRoutePathSaveModel(_.cloneDeep(newRoutePath), null);
        const response = (await HttpUtils.createObject(
            EndpointPath.ROUTE_PATH,
            routePathSaveModel
        )) as IRoutePathPrimaryKey;
        return response;
    };

    public static removeRoutePath = async (routePathPrimaryKey: IRoutePathPrimaryKey) => {
        await HttpUtils.deleteObject(EndpointPath.ROUTE_PATH_REMOVE, routePathPrimaryKey);
    };

    public static fetchRoutePathsUsingLink = async (
        startNodeId: string,
        endNodeId: string,
        transitType: string
    ): Promise<IRoutePath[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getRoutePathsUsingLinkQuery(),
            variables: { startNodeId, endNodeId, transitType },
        });

        const externalRoutePathLinks: IExternalRoutePath[] =
            queryResult.data.get_route_paths_using_link.nodes;
        return externalRoutePathLinks.map((externalRoutePath: IExternalRoutePath) => {
            const lineId = externalRoutePath.reittiByReitunnus.linjaByLintunnus.lintunnus;
            const transitType = externalRoutePath.reittiByReitunnus.linjaByLintunnus.linverkko;
            return RoutePathFactory.mapExternalRoutePath(externalRoutePath, lineId, transitType);
        });
    };

    public static fetchRoutePathsUsingNode = async (nodeId: string): Promise<IRoutePath[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getRoutePathsUsingNodeQuery(),
            variables: { nodeId },
        });
        const externalRoutePaths: IExternalRoutePath[] =
            queryResult.data.get_route_paths_using_node.nodes;
        return externalRoutePaths.map((externalRoutePath: IExternalRoutePath) => {
            const lineId = externalRoutePath.reittiByReitunnus.linjaByLintunnus.lintunnus;
            const transitType = externalRoutePath.reittiByReitunnus.linjaByLintunnus.linverkko;
            return RoutePathFactory.mapExternalRoutePath(externalRoutePath, lineId, transitType);
        });
    };
}

const _createRoutePathSaveModel = (
    newRoutePath: IRoutePath,
    oldRoutePath: IRoutePath | null
): IRoutePathSaveModel => {
    const added: IRoutePathLink[] = [];
    const modified: IRoutePathLink[] = [];
    const removed: IRoutePathLink[] = [];
    const originals: IRoutePathLink[] = [];
    newRoutePath.routePathLinks.forEach((rpLink) => {
        const foundOldRoutePathLink = oldRoutePath
            ? _findRoutePathLink(oldRoutePath, rpLink)
            : null;
        if (foundOldRoutePathLink) {
            const isModified = !_.isEqual(foundOldRoutePathLink, rpLink);
            // If a routePathLink is found from both newRoutePath and oldRoutePath and it has modifications, add to modified [] list
            if (isModified) {
                // Make sure we keep the old id (rpLink has temp id (including NEW_OBJECT_TAG) if link was removed and then added again)
                rpLink.id = foundOldRoutePathLink.id;
                rpLink.viaNameId = foundOldRoutePathLink.id;
                rpLink.viaShieldNameId = foundOldRoutePathLink.id;
                modified.push(rpLink);
            } else {
                originals.push(rpLink);
            }
        } else {
            // If a routePathLink is found from newRoutePath but not in oldRoutePath, add it to added [] list
            added.push(rpLink);
        }
    });
    oldRoutePath?.routePathLinks.forEach((rpLink) => {
        const routePathLink = _findRoutePathLink(newRoutePath, rpLink);
        if (!routePathLink) {
            // If a routePathLink from oldRoutePath is not found from newRoutePath, add it to removed [] list
            removed.push(rpLink);
        }
    });

    const routePathLinkSaveModel: IRoutePathLinkSaveModel = {
        added,
        modified,
        removed,
        originals,
    };

    const routePathToSave = {
        ...newRoutePath,
    };
    delete routePathToSave['routePathLinks'];

    return {
        routePathLinkSaveModel,
        originalPrimaryKey: {
            routeId: routePathToSave.routeId,
            direction: routePathToSave.direction,
            startDate: routePathToSave.startDate,
        },
        routePath: routePathToSave,
    };
};

const _findRoutePathLink = (
    routePath: IRoutePath,
    routePathLink: IRoutePathLink
): IRoutePathLink | undefined => {
    return routePath.routePathLinks.find((rpLink) => {
        return (
            // Use node.internalId (node.id might be duplicated)
            rpLink.startNode.internalId === routePathLink.startNode.internalId &&
            rpLink.endNode.internalId === routePathLink.endNode.internalId
        );
    });
};

const _getFirstStopName = (nodes: IExternalRoutePathLink[]) => {
    for (let i = 0; i < nodes.length; i += 1) {
        const stopName = _getValidStopName(nodes[i].solmuByLnkalkusolmu);
        if (stopName) {
            return stopName;
        }
    }
    return '';
};

const _getLastStopName = (nodes: IExternalRoutePathLink[]) => {
    for (let i = nodes.length - 1; i > 0; i -= 1) {
        const stopName = _getValidStopName(nodes[i].solmuByLnkloppusolmu);
        if (stopName) {
            return stopName;
        }
    }
    return '';
};

const _getValidStopName = (node: IExternalNode): string | null => {
    if (node.soltyyppi === NodeType.STOP && node.pysakkiBySoltunnus?.pysnimi) {
        return node.pysakkiBySoltunnus.pysnimi;
    }
    return null;
};

export default RoutePathService;
