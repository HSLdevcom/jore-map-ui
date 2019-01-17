import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import IRoutePathLink from '~/models/IRoutePathLink';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import IExternalLink from '~/models/externals/IExternalLink';
import GraphqlQueries from './graphqlQueries';

// TODO: create two services, RoutePathLinkService and LinkService?
class RoutePathLinkService {
    public static
        async fetchAndCreateRoutePathLinksWithStartNodeId(nodeId: string, orderNumber: number)
        : Promise<IRoutePathLink[]> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: GraphqlQueries.getLinksByStartNodeQuery(), variables: { nodeId } },
            );
            return queryResult.data.solmuBySoltunnus.
                linkkisByLnkalkusolmu.nodes.map((link: IExternalLink) =>
                    RoutePathLinkFactory.createNewRoutePathLinkFromExternalLink(link, orderNumber),
            );
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

    public static async fetchRoutePathLink(id: number) : Promise<IRoutePathLink | null> {
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
