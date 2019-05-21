import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import { NeighborToAddType } from '~/stores/routePathStore';
import ErrorStore from '~/stores/errorStore';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import RoutePathFactory from '~/factories/routePathFactory';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath';
import { IRoutePath } from '~/models';
import INeighborLink from '~/models/INeighborLink';
import IGraphqlList from '~/models/externals/graphqlModelHelpers/IGraphqlList';
import IExternalNode from '~/models/externals/IExternalNode';
import IExternalLink from '~/models/externals/IExternalLink';
import GraphqlQueries from './graphqlQueries';

interface IExtendedExternalNode extends IExternalNode {
    usageDuringDate?: IGraphqlList<IExternalRoutePath>;
}

interface IExtendedExternalLink extends IExternalLink {
    solmuByLnkalkusolmu: IExtendedExternalNode;
    solmuByLnkloppusolmu: IExtendedExternalNode;
}

interface IFetchNeighborLinksResponse {
    neighborToAddType: NeighborToAddType;
    neighborLinks: INeighborLink[];
}

const getNeighborLinks = (
    queryResult: any,
    orderNumber: number,
    from: 'startNode' | 'endNode'
): INeighborLink[] => {
    const linkPropertyName =
        from === 'startNode'
            ? 'linkkisByLnkalkusolmu'
            : 'linkkisByLnkloppusolmu';
    const nodePropertyName =
        from === 'startNode' ? 'solmuByLnkloppusolmu' : 'solmuByLnkalkusolmu';
    return _parseNeighborLinks(
        queryResult,
        orderNumber,
        linkPropertyName,
        nodePropertyName
    );
};

const _parseNeighborLinks = (
    queryResult: any,
    orderNumber: number,
    linkPropertyName: string,
    nodePropertyName: string
): INeighborLink[] => {
    return queryResult.data.solmuBySoltunnus[linkPropertyName].nodes.map(
        (link: IExtendedExternalLink): INeighborLink => ({
            routePathLink: RoutePathLinkFactory.mapExternalRoutePathLinkFromExternalLink(
                link,
                orderNumber
            ),
            nodeUsageRoutePaths: link[
                nodePropertyName
            ].usageDuringDate!.nodes.map((rp: IExternalRoutePath) =>
                RoutePathFactory.mapExternalRoutePath(rp)
            )
        })
    );
};

class RoutePathNeighborLinkService {
    public static fetchAndCreateRoutePathLinksWithNodeId = async (
        nodeId: string,
        neighborToAddType: NeighborToAddType,
        routePath: IRoutePath,
        orderNumber: number,
        date: Date
    ): Promise<INeighborLink[]> => {
        let res: INeighborLink[] = [];

        // If new routePathLinks should be created after the node
        if (neighborToAddType === NeighborToAddType.AfterNode) {
            const queryResult: ApolloQueryResult<
                any
            > = await apolloClient.query({
                query: GraphqlQueries.getLinksByStartNodeQuery(),
                variables: { nodeId, date }
            });
            res = getNeighborLinks(queryResult, orderNumber, 'startNode');

            // If new routePathLinks should be created before the node
        } else if (neighborToAddType === NeighborToAddType.BeforeNode) {
            const queryResult: ApolloQueryResult<
                any
            > = await apolloClient.query({
                query: GraphqlQueries.getLinksByEndNodeQuery(),
                variables: { nodeId, date }
            });
            res = getNeighborLinks(queryResult, orderNumber, 'endNode');
        } else {
            throw new Error(
                `neighborToAddType not supported: ${neighborToAddType}`
            );
        }
        return res.filter(
            rpLink => rpLink.routePathLink.transitType === routePath.transitType
        );
    };

    public static fetchNeighborRoutePathLinks = async (
        nodeId: string,
        routePath: IRoutePath,
        linkOrderNumber: number
    ): Promise<IFetchNeighborLinksResponse | null> => {
        const routePathLinks = routePath.routePathLinks;
        const startNodeCount = routePathLinks.filter(
            link => link.startNode.id === nodeId
        ).length;
        const endNodeCount = routePathLinks.filter(
            link => link.endNode.id === nodeId
        ).length;
        let neighborToAddType;
        let orderNumber;
        if (startNodeCount <= endNodeCount) {
            neighborToAddType = NeighborToAddType.AfterNode;
            orderNumber = linkOrderNumber + 1;
        } else {
            neighborToAddType = NeighborToAddType.BeforeNode;
            orderNumber = linkOrderNumber;
        }

        try {
            const neighborLinks = await RoutePathNeighborLinkService.fetchAndCreateRoutePathLinksWithNodeId(
                nodeId,
                neighborToAddType,
                routePath,
                orderNumber,
                new Date()
            );
            if (neighborLinks.length === 0) {
                ErrorStore.addError(
                    `Tästä solmusta (soltunnus: ${nodeId}) alkavaa linkkiä ei löytynyt.`
                );
            } else {
                return {
                    neighborToAddType,
                    neighborLinks
                };
            }
        } catch (e) {
            ErrorStore.addError('Haku löytää naapurisolmuja epäonnistui', e);
        }
        return null;
    };
}

export default RoutePathNeighborLinkService;
