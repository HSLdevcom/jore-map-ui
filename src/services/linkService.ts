import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import ILink from '~/models/ILink';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import LinkFactory from '~/factories/linkFactory';
import IExternalLink from '~/models/externals/IExternalLink';
import GraphqlQueries from './graphqlQueries';

export default class LinkService {
    public static async fetchLinksByStartNodeAndEndNode(nodeId: string, transitTypeCode: string)
        : Promise<ILink[]> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: GraphqlQueries.getLinksByStartNodeAndEndNodeQuery(),
                    variables: { nodeId } },
            );
            const queriedLinks = [
                ...queryResult.data.solmuBySoltunnus.linkkisByLnkalkusolmu.nodes,
                ...queryResult.data.solmuBySoltunnus.linkkisByLnkloppusolmu.nodes];
            return queriedLinks
                .map((link: IExternalLink) =>
                LinkFactory.createLinkFromExternalLink(link),
            );
        } catch (error) {
            console.error(error); // tslint:disable-line
            notificationStore.addNotification({
                message: `Haku löytää linkkejä, joilla lnkalkusolmu tai lnkloppusolmu on ${nodeId} (soltunnus), ei onnistunut.`, // tslint:disable max-line-length
                type: NotificationType.ERROR,
            });
            return [];
        }
    }
}
