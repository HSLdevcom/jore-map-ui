import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import IRoutePathLink from '~/models/IRoutePathLink';
import { NeighborToAddType } from '~/stores/routePathStore';
import ErrorStore from '~/stores/errorStore';
import TransitType from '~/enums/transitType';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import IExternalLink from '~/models/externals/IExternalLink';
import GraphqlQueries from './graphqlQueries';

class RoutePathLinkService {
    public static fetchAndCreateRoutePathLinksWithNodeId = async (
        nodeId: string,
        neighborToAddType: NeighborToAddType,
        orderNumber: number,
        transitType: TransitType,
    ): Promise<IRoutePathLink[]> => {
        let res: IRoutePathLink[] = [];
        // If new routePathLinks should be created after the node
        if (neighborToAddType === NeighborToAddType.AfterNode) {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: GraphqlQueries.getLinksByStartNodeQuery()
                , variables: { nodeId } },
            );
            res = queryResult.data.solmuBySoltunnus.
                linkkisByLnkalkusolmu.nodes.map((link: IExternalLink) =>
                    RoutePathLinkFactory.createNewRoutePathLinkFromExternalLink(link, orderNumber),
            );
        // If new routePathLinks should be created before the node
        } else if (neighborToAddType === NeighborToAddType.BeforeNode) {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: GraphqlQueries.getLinksByEndNodeQuery()
                , variables: { nodeId } },
            );
            res = queryResult.data.solmuBySoltunnus.
                linkkisByLnkloppusolmu.nodes.map((link: IExternalLink) =>
                    RoutePathLinkFactory.createNewRoutePathLinkFromExternalLink(link, orderNumber),
            );
        } else {
            throw new Error(`neighborToAddType not supported: ${neighborToAddType}`);
        }
        return res.filter(rpLink => rpLink.transitType === transitType);
    }

    public static fetchRoutePathLink = async (id: number): Promise<IRoutePathLink> => {
        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
            { query: GraphqlQueries.getRoutePathLinkQuery(), variables: { routeLinkId: id } },
        );
        return RoutePathLinkFactory.createRoutePathLink(queryResult.data.routePathLink);
    }

    public static fetchNeighborRoutePathLinks = async (
        nodeId: string,
        linkOrderNumber: number,
        transitType: TransitType,
        routePathLinks?: IRoutePathLink[],
    ) => {
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
            const routePathLinks =
            await RoutePathLinkService.fetchAndCreateRoutePathLinksWithNodeId(
                nodeId,
                neighborToAddType,
                orderNumber,
                transitType);
            if (routePathLinks.length === 0) {
                // tslint:disable-next-line:max-line-length
                ErrorStore.addError(`Tästä solmusta (soltunnus: ${nodeId}) alkavaa linkkiä ei löytynyt.`);
            } else {
                return {
                    routePathLinks,
                    neighborToAddType,
                };
            }
        } catch (ex) {
            ErrorStore.addError('Haku löytää sopivia naapurisolmuja epäonnistui');
        }
        return null;
    }
}
// const routePathLinks = RoutePathStore.routePath!.routePathLinks;
export default RoutePathLinkService;
