import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import IRoutePathLink from '~/models/IRoutePathLink';
import { NeighborToAddType } from '~/stores/routePathStore';
import ErrorStore from '~/stores/errorStore';
import TransitType from '~/enums/transitType';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import INeighborLink from '~/models/INeighborLink';
import IGraphqlList from '~/models/externals/graphqlModelHelpers/IGraphqlList';
import IExternalNode from '~/models/externals/IExternalNode';
import IExternalLink from '~/models/externals/IExternalLink';
import GraphqlQueries from './graphqlQueries';

interface ISimplifiedRoutePath {
    reitunnus: string;
}

interface IExtendedExternalNode extends IExternalNode {
    usageDuringDate?: IGraphqlList<ISimplifiedRoutePath>;
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
    queryResult: any, orderNumber: number, from: 'startNode' | 'endNode',
): INeighborLink[] => {
    const linkPropertyName = from === 'startNode'
        ? 'linkkisByLnkalkusolmu' : 'linkkisByLnkloppusolmu';
    const nodePropertyName = from === 'startNode'
        ? 'solmuByLnkloppusolmu' : 'solmuByLnkalkusolmu';
    return _getNeighborLinks(queryResult, orderNumber, linkPropertyName, nodePropertyName);
};

const _getNeighborLinks = (
    queryResult: any, orderNumber: number, linkPropertyName: string, nodePropertyName: string,
): INeighborLink[] => {
    return queryResult.data.solmuBySoltunnus[linkPropertyName]
        .nodes.map((link: IExtendedExternalLink) => ({
            routePathLink:
                RoutePathLinkFactory
                    .createNewRoutePathLinkFromExternalLink(link, orderNumber),
            usages: link[nodePropertyName].usageDuringDate!
                .nodes.map((e: any) => e.reitunnus),
        }));
};

class RoutePathNeighborLinkService {
    public static fetchAndCreateRoutePathLinksWithNodeId = async (
        nodeId: string,
        neighborToAddType: NeighborToAddType,
        orderNumber: number,
        transitType: TransitType,
        date: Date,
    ): Promise<INeighborLink[]> => {
        let res: INeighborLink[] = [];

        // If new routePathLinks should be created after the node
        if (neighborToAddType === NeighborToAddType.AfterNode) {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: GraphqlQueries.getLinksByStartNodeQuery()
                , variables: { nodeId, date } },
            );
            res = getNeighborLinks(
                queryResult,
                orderNumber,
                'startNode',
            );

        // If new routePathLinks should be created before the node
        } else if (neighborToAddType === NeighborToAddType.BeforeNode) {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: GraphqlQueries.getLinksByEndNodeQuery()
                , variables: { nodeId, date } },
            );
            res = getNeighborLinks(
                queryResult,
                orderNumber,
                'endNode',
            );
        } else {
            throw new Error(`neighborToAddType not supported: ${neighborToAddType}`);
        }
        return res.filter(rpLink => rpLink.routePathLink.transitType === transitType);
    }

    public static fetchNeighborRoutePathLinks = async (
        nodeId: string,
        linkOrderNumber: number,
        transitType: TransitType,
        routePathLinks?: IRoutePathLink[],
    ): Promise<IFetchNeighborLinksResponse | null> => {
        const startNodeCount = routePathLinks!.filter(link => link.startNode.id === nodeId).length;
        const endNodeCount = routePathLinks!.filter(link => link.endNode.id === nodeId).length;
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
            const neighborLinks =
                await RoutePathNeighborLinkService.fetchAndCreateRoutePathLinksWithNodeId(
                    nodeId,
                    neighborToAddType,
                    orderNumber,
                    transitType,
                    new Date());
            if (neighborLinks.length === 0) {
                // tslint:disable-next-line:max-line-length
                ErrorStore.addError(`Tästä solmusta (soltunnus: ${nodeId}) alkavaa linkkiä ei löytynyt.`);
            } else {
                return {
                    neighborToAddType,
                    neighborLinks,
                };
            }
        } catch (e) {
            ErrorStore.addError('Haku löytää naapurisolmuja epäonnistui', e);
        }
        return null;
    }
}

export default RoutePathNeighborLinkService;
