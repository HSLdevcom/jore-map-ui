import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import apolloClient from '~/util/ApolloClient';
import IRoutePathLink from '~/models/IRoutePathLink';
import notificationStore from '~/stores/notificationStore';
import NotificationType from '~/enums/notificationType';
import RoutePathLinkFactory from '~/factories/routePathLinkFactory';
import IExternalLink from '~/models/externals/IExternalLink';

export default class RoutePathLinkService {
    public static async fetchAndCreateRoutePathLinksWithStartNodeId(nodeId: string)
        : Promise<IRoutePathLink[]> {
        try {
            const queryResult: ApolloQueryResult<any> = await apolloClient.query(
                { query: getLinksWithRoutePathLinkStartNodeIdQuery, variables: { nodeId } },
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
                { query: getRoutePathLinkByRoutePathLinkId, variables: { routeLinkId: id } },
            );
            return RoutePathLinkFactory.createRoutePathLink(queryResult.data.routePathLink);
        } catch (error) {
            console.error(error); // tslint:disable-line
            notificationStore.addNotification({
                message: `Ei onnistunut.`,
                type: NotificationType.ERROR,
            });
            return null;
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
                    soltunnusSolmu
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

const getRoutePathLinkByRoutePathLinkId = gql`
query getRoutePathLink($routeLinkId: Int!) {
    routePathLink: reitinlinkkiByRelid(relid: $routeLinkId) {
    reitunnus
    reljarjnro
    lnkverkko
    lnkverkko
    lnkalkusolmu
    lnkloppusolmu
    linkkiByLnkverkkoAndLnkalkusolmuAndLnkloppusolmu {
        geojson
    }
}
}
`;
