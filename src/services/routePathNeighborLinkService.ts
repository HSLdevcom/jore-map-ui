import { ApolloQueryResult } from 'apollo-client';
import TransitType from '~/enums/transitType';
import RoutePathFactory from '~/factories/routePathFactory';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import ApolloClient from '~/helpers/ApolloClient';
import { IRoutePath } from '~/models';
import INeighborLink from '~/models/INeighborLink';
import IExternalLink from '~/models/externals/IExternalLink';
import IExternalNode from '~/models/externals/IExternalNode';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath';
import IGraphqlList from '~/models/externals/graphqlModelHelpers/IGraphqlList';
import ErrorStore from '~/stores/errorStore';
import { NeighborToAddType } from '~/stores/routePathLayerStore';
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
        from === 'startNode' ? 'linkkisByLnkalkusolmu' : 'linkkisByLnkloppusolmu';
    const nodePropertyName = from === 'startNode' ? 'solmuByLnkloppusolmu' : 'solmuByLnkalkusolmu';
    return _parseNeighborLinks(queryResult, orderNumber, linkPropertyName, nodePropertyName);
};

const _parseNeighborLinks = (
    queryResult: any,
    orderNumber: number,
    linkPropertyName: string,
    nodePropertyName: string
): INeighborLink[] => {
    return queryResult.data.solmuBySoltunnus[linkPropertyName].nodes.map(
        (link: IExtendedExternalLink): INeighborLink => ({
            routePathLink: RoutePathLinkFactory.mapExternalLink(link, orderNumber),
            nodeUsageRoutePaths: link[nodePropertyName].usageDuringDate!.nodes.map(
                (rp: IExternalRoutePath) => {
                    const transitType = rp.reittiByReitunnus.linjaByLintunnus.linverkko;
                    const lineId = rp.reittiByReitunnus.linjaByLintunnus.lintunnus;
                    return RoutePathFactory.mapExternalRoutePath({
                        lineId,
                        transitType,
                        externalRoutePath: rp,
                    });
                }
            ),
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
            const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
                query: GraphqlQueries.getLinksByStartNodeQuery(),
                variables: { nodeId, date },
            });
            res = getNeighborLinks(queryResult, orderNumber, 'startNode');
            // If new routePathLinks should be created before the node
        } else if (neighborToAddType === NeighborToAddType.BeforeNode) {
            const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
                query: GraphqlQueries.getLinksByEndNodeQuery(),
                variables: { nodeId, date },
            });
            res = getNeighborLinks(queryResult, orderNumber, 'endNode');
        } else {
            throw new Error(`neighborToAddType not supported: ${neighborToAddType}`);
        }
        const transitType: TransitType = _getTransitType(routePath);
        return res.filter((rpLink) => rpLink.routePathLink.transitType === transitType);
    };

    public static fetchNeighborRoutePathLinks = async (
        nodeId: string,
        routePath: IRoutePath,
        linkOrderNumber: number
    ): Promise<IFetchNeighborLinksResponse | null> => {
        const routePathLinks = routePath.routePathLinks;
        const startNodeCount = routePathLinks.filter((link) => link.startNode.id === nodeId).length;
        const endNodeCount = routePathLinks.filter((link) => link.endNode.id === nodeId).length;
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
                    neighborLinks,
                };
            }
        } catch (e) {
            ErrorStore.addError('Haku löytää naapurisolmuja epäonnistui', e);
        }
        return null;
    };
}

// Returns rpLinks' transitType if rpLinks exist
const _getTransitType = (routePath: IRoutePath) => {
    const rpLinks = routePath.routePathLinks;
    if (rpLinks.length === 0) return routePath.transitType!;

    return rpLinks[0].transitType;
};

export default RoutePathNeighborLinkService;
