import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import IRoutePathLink from '~/models/IRoutePathLink';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import TransitType from '~/enums/transitType';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import IExternalLink from '~/models/externals/IExternalLink';
import { AddLinkDirection } from '~/stores/routePathStore';
import GraphqlQueries from './graphqlQueries';

// TODO: create two services, RoutePathLinkService and LinkService?
class RoutePathLinkService {
    public static
        fetchAndCreateRoutePathLinksWithNodeId =
            async (
                nodeId: string,
                linkDirection: AddLinkDirection,
                orderNumber: number,
                transitType: TransitType,
            ):
                Promise<IRoutePathLink[]> => {
                try {
                    let res: IRoutePathLink[] = [];
                    // If new routePathLinks should be created after the node
                    if (linkDirection === AddLinkDirection.AfterNode) {
                        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                            { query: GraphqlQueries.getLinksByStartNodeQuery()
                            , variables: { nodeId } },
                        );
                        res = queryResult.data.solmuBySoltunnus.
                            linkkisByLnkalkusolmu.nodes.map((link: IExternalLink) =>
                                RoutePathLinkFactory.createNewRoutePathLinkFromExternalLink(
                                    link, orderNumber),
                        );
                    } else {
                        // If new routePathLinks should be created before the node
                        const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                            { query: GraphqlQueries.getLinksByEndNodeQuery()
                            , variables: { nodeId } },
                        );
                        res = queryResult.data.solmuBySoltunnus.
                            linkkisByLnkloppusolmu.nodes.map((link: IExternalLink) =>
                                RoutePathLinkFactory.createNewRoutePathLinkFromExternalLink(
                                    link, orderNumber),
                        );
                    }
                    return res.filter(rpLink => rpLink.transitType === transitType);

                } catch (error) {
                    console.error(error); // tslint:disable-line
                    notificationStore.addNotification({
                        message: `Haku löytää reitin linkkien Lnkalkusolmu solmuja, joilla on
                            soltunnus ${nodeId}, ei onnistunut.`,
                        type: NotificationType.ERROR,
                    });
                    return [];
                }
            }

    public static fetchRoutePathLink = async (id: number): Promise<IRoutePathLink | null> => {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: GraphqlQueries.getRoutePathLinkQuery(), variables: { routeLinkId: id } },
            );
            return RoutePathLinkFactory.createRoutePathLink(queryResult.data.routePathLink);
        } catch (error) {
            console.error(error); // tslint:disable-line
            notificationStore.addNotification({
                message: `Haku löytää linkki (${id}) ei onnistunut.`,
                type: NotificationType.ERROR,
            });
            return null;
        }
    }
}

export default RoutePathLinkService;
