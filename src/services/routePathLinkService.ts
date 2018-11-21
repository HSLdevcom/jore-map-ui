import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import IRoutePathLink from '~/models/IRoutePathLink';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';

export default class RoutePathLinkService {
    public static async fetchLinksWithLinkStartNodeId(nodeId: string)
        : Promise<IRoutePathLink[]> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getLinksWithRoutePathLinkStartNodeIdQuery, variables: { nodeId } },
            );
            return queryResult.data.solmuBySoltunnus.
                linkkisByLnkalkusolmu.nodes.map((link: any) =>
                    RoutePathLinkFactory.createNewRoutePathLinkFromExternalLink(link),
            );
        } catch (err) {
            notificationStore.addNotification({
                message: `Haku löytää reitin linkkien Lnkalkusolmu solmuja, joilla on
                    soltunnus ${nodeId}, ei onnistunut.`,
                type: NotificationType.ERROR,
            });
            return [];
        }
    }
}

const getLinksWithRoutePathLinkStartNodeIdQuery = gql`
query getNodesWithRoutePathLinkStartNodeId($nodeId: String!) {
    solmuBySoltunnus(soltunnus: $nodeId) {
        linkkisByLnkalkusolmu {
            nodes {
                lnkverkko
                geojson
                solmuByLnkalkusolmu {
                    soltunnus
                    geojson
                    soltyyppi
                    solkirjain
                    geojsonManual
                }
                solmuByLnkloppusolmu {
                    soltunnus
                    geojson
                    soltyyppi
                    solkirjain
                    geojsonManual
                }
            }
        }
    }
}
`;
