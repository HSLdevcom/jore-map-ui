import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import IRoutePathLink from '~/models/IRoutePathLink';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink';
import IExternalLink from '~/models/externals/IExternalLink';
import GraphqlQueries from './graphqlQueries';

// TODO: create two services, RoutePathLinkService and LinkService?
export default class RoutePathLinkService {
    public static async fetchAndCreateRoutePathLinksWithStartNodeId(nodeId: string)
        : Promise<IRoutePathLink[]> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: GraphqlQueries.getLinksQuery(), variables: { nodeId } },
            );
            return queryResult.data.solmuBySoltunnus.
                linkkisByLnkalkusolmu.nodes.map((link: IExternalLink) =>
                    RoutePathLinkFactory.createNewRoutePathLinkFromExternalLink(link),
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
            const externalRoutePathLink =
                this.getExternalRoutePathLink(queryResult.data.routePathLink);
            return RoutePathLinkFactory.createRoutePathLink(externalRoutePathLink);
        } catch (error) {
            console.error(error); // tslint:disable-line
            notificationStore.addNotification({
                message: `Ei onnistunut.`,
                type: NotificationType.ERROR,
            });
            return null;
        }
    }

    // TODO: Remove these extra mappings
    private static getExternalRoutePathLink(externalRoutePathLink: any): IExternalRoutePathLink {
        externalRoutePathLink.geojson = externalRoutePathLink
            .linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu.geojson;
        externalRoutePathLink.link = externalRoutePathLink
            .linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu;
        externalRoutePathLink.startNode = externalRoutePathLink
            .solmuByLnkalkusolmu;
        externalRoutePathLink.endNode = externalRoutePathLink
            .solmuByLnkloppusolmu;

        externalRoutePathLink.startNode.externalStop
            = externalRoutePathLink.startNode.pysakkiBySoltunnus;

        externalRoutePathLink.endNode.externalStop
            = externalRoutePathLink.endNode.pysakkiBySoltunnus;

        delete externalRoutePathLink
            .linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu;
        delete externalRoutePathLink
            .solmuByLnkalkusolmu;
        delete externalRoutePathLink
            .solmuByLnkloppusolmu;

        return externalRoutePathLink;
    }
}
